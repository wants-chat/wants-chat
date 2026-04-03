/**
 * React Native Form Component Generators
 *
 * Generates form components for React Native including:
 * - Select
 * - DatePicker
 * - TimePicker
 * - Textarea
 * - Checkbox
 * - RadioGroup
 */

// ============================================
// Select Component
// ============================================

/**
 * Generate Select component for React Native
 */
export function generateSelect(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Select({
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  required = false,
  style,
  labelStyle,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange(option.value);
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                    item.disabled && styles.optionDisabled,
                  ]}
                  onPress={() => handleSelect(item)}
                  disabled={item.disabled}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                      item.disabled && styles.optionTextDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
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
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  selectButtonError: {
    borderColor: '#EF4444',
  },
  selectButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  optionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  optionTextDisabled: {
    color: '#9CA3AF',
  },
});

export default Select;
`;
}

// ============================================
// DatePicker Component
// ============================================

/**
 * Generate DatePicker component for React Native
 */
export function generateDatePicker(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'datetime';
  displayFormat?: (date: Date) => string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const defaultFormat = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  disabled = false,
  required = false,
  minimumDate,
  maximumDate,
  mode = 'date',
  displayFormat = defaultFormat,
  style,
  labelStyle,
}: DatePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          error && styles.buttonError,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.icon} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? displayFormat(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  buttonError: {
    borderColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default DatePicker;
`;
}

// ============================================
// TimePicker Component
// ============================================

/**
 * Generate TimePicker component for React Native
 */
export function generateTimePicker(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface TimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  is24Hour?: boolean;
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  displayFormat?: (date: Date) => string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const defaultFormat = (date: Date, is24Hour: boolean) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !is24Hour,
  });
};

export function TimePicker({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  disabled = false,
  required = false,
  is24Hour = false,
  minuteInterval = 1,
  displayFormat,
  style,
  labelStyle,
}: TimePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    if (displayFormat) {
      return displayFormat(date);
    }
    return defaultFormat(date, is24Hour);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          error && styles.buttonError,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => !disabled && setShow(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Ionicons name="time-outline" size={20} color="#6B7280" style={styles.icon} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatTime(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={is24Hour}
          minuteInterval={minuteInterval}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  buttonError: {
    borderColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default TimePicker;
`;
}

// ============================================
// Textarea Component
// ============================================

/**
 * Generate Textarea component for React Native
 */
export function generateTextarea(): string {
  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

export interface TextareaProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  showCount?: boolean;
  minHeight?: number;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function Textarea({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  maxLength,
  showCount = false,
  minHeight = 100,
  maxHeight = 200,
  style,
  labelStyle,
  inputStyle,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          { minHeight, maxHeight },
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        editable={!disabled}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      <View style={styles.footer}>
        {(error || helperText) && (
          <Text style={[styles.helperText, error && styles.errorText]}>
            {error || helperText}
          </Text>
        )}
        {showCount && maxLength && (
          <Text style={styles.count}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
  },
  count: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

export default Textarea;
`;
}

// ============================================
// Checkbox Component
// ============================================

/**
 * Generate Checkbox component for React Native
 */
export function generateCheckbox(): string {
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

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const SIZE_CONFIG = {
  sm: { box: 18, icon: 14, font: 14 },
  md: { box: 22, icon: 18, font: 16 },
  lg: { box: 26, icon: 22, font: 18 },
};

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  error,
  size = 'md',
  color = '#3B82F6',
  style,
  labelStyle,
}: CheckboxProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => !disabled && onChange(!checked)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View
          style={[
            styles.checkbox,
            {
              width: sizeConfig.box,
              height: sizeConfig.box,
              borderRadius: 4,
            },
            checked && { backgroundColor: color, borderColor: color },
            disabled && styles.checkboxDisabled,
            error && styles.checkboxError,
          ]}
        >
          {checked && (
            <Ionicons name="checkmark" size={sizeConfig.icon} color="#FFFFFF" />
          )}
        </View>
        {(label || description) && (
          <View style={styles.labelContainer}>
            {label && (
              <Text
                style={[
                  styles.label,
                  { fontSize: sizeConfig.font },
                  disabled && styles.labelDisabled,
                  labelStyle,
                ]}
              >
                {label}
              </Text>
            )}
            {description && (
              <Text style={[styles.description, disabled && styles.labelDisabled]}>
                {description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  checkboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  checkboxError: {
    borderColor: '#EF4444',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    color: '#111827',
    fontWeight: '400',
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 32,
  },
});

export default Checkbox;
`;
}

// ============================================
// RadioGroup Component
// ============================================

/**
 * Generate RadioGroup component for React Native
 */
export function generateRadioGroup(): string {
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

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  horizontal?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function RadioGroup({
  value,
  options,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  horizontal = false,
  color = '#3B82F6',
  style,
  labelStyle,
}: RadioGroupProps) {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={[styles.options, horizontal && styles.optionsHorizontal]}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, horizontal && styles.optionHorizontal]}
              onPress={() => !isDisabled && onChange(option.value)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.radio,
                  isSelected && { borderColor: color },
                  isDisabled && styles.radioDisabled,
                  error && styles.radioError,
                ]}
              >
                {isSelected && (
                  <View style={[styles.radioInner, { backgroundColor: color }]} />
                )}
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    isDisabled && styles.optionLabelDisabled,
                  ]}
                >
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={[styles.optionDescription, isDisabled && styles.optionLabelDisabled]}>
                    {option.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  options: {},
  optionsHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  optionHorizontal: {
    marginRight: 24,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  radioError: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionContent: {
    flex: 1,
    marginLeft: 10,
  },
  optionLabel: {
    fontSize: 16,
    color: '#111827',
  },
  optionLabelDisabled: {
    color: '#9CA3AF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default RadioGroup;
`;
}
