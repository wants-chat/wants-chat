/**
 * Forms Component Generators for React Native
 * Comprehensive form components for mobile apps
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Re-export existing generators
export { generateRNLoginForm } from './login-form.generator';
export { generateRNRegisterForm } from './register-form.generator';
export { generateRNSearchBar } from './search-bar.generator';

// Text Input
export function generateRNTextInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet } from 'react-native';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
}

export default function TextInput({ label, placeholder, value, onChangeText, error, disabled, secureTextEntry }: TextInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, disabled && styles.inputDisabled]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9ca3af"
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  inputError: { borderColor: '#ef4444' },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TextInput as RNTextInput, StyleSheet } from 'react-native';"],
  };
}

// Text Area
export function generateRNTextArea(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  rows?: number;
  maxLength?: number;
  error?: string;
}

export default function TextArea({ label, placeholder, value, onChangeText, rows = 4, maxLength, error }: TextAreaProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, { minHeight: rows * 24 }, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={rows}
        maxLength={maxLength}
        textAlignVertical="top"
        placeholderTextColor="#9ca3af"
      />
      {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  inputError: { borderColor: '#ef4444' },
  charCount: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TextInput, StyleSheet } from 'react-native';"],
  };
}

// Number Input
export function generateRNNumberInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function NumberInput({ label, value, onChange, min = 0, max = 100, step = 1 }: NumberInputProps) {
  const increment = () => onChange(Math.min(max, value + step));
  const decrement = () => onChange(Math.max(min, value - step));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.btn} onPress={decrement}><Ionicons name="remove" size={20} color="#374151" /></TouchableOpacity>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={(t) => { const n = parseInt(t) || 0; onChange(Math.max(min, Math.min(max, n))); }}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.btn} onPress={increment}><Ionicons name="add" size={20} color="#374151" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  btn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111827', paddingVertical: 12 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Select Dropdown
export function generateRNSelectDropdown(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option { value: string; label: string; }
interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function SelectDropdown({ label, placeholder = 'Select...', options, value, onChange, error }: SelectDropdownProps) {
  const [visible, setVisible] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={[styles.select, error && styles.selectError]} onPress={() => setVisible(true)}>
        <Text style={[styles.selectText, !selected && styles.placeholder]}>{selected?.label || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.option, item.value === value && styles.optionSelected]} onPress={() => { onChange(item.value); setVisible(false); }}>
                  <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color="#3b82f6" />}
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
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  selectError: { borderColor: '#ef4444' },
  selectText: { fontSize: 16, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  dropdown: { backgroundColor: '#fff', borderRadius: 16, maxHeight: 300 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionSelected: { backgroundColor: '#eff6ff' },
  optionText: { fontSize: 16, color: '#111827' },
  optionTextSelected: { color: '#3b82f6', fontWeight: '500' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';"],
  };
}

// Multi Select
export function generateRNMultiSelect(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option { value: string; label: string; }
interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function MultiSelect({ label, placeholder = 'Select...', options, values, onChange }: MultiSelectProps) {
  const [visible, setVisible] = useState(false);
  const toggle = (val: string) => onChange(values.includes(val) ? values.filter(v => v !== val) : [...values, val]);
  const selectedLabels = options.filter(o => values.includes(o.value)).map(o => o.label);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.select} onPress={() => setVisible(true)}>
        {selectedLabels.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsRow}>
              {selectedLabels.map((l, i) => <View key={i} style={styles.chip}><Text style={styles.chipText}>{l}</Text></View>)}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => toggle(item.value)}>
                  <View style={[styles.checkbox, values.includes(item.value) && styles.checkboxChecked]}>
                    {values.includes(item.value) && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.optionText}>{item.label}</Text>
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
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 52 },
  placeholder: { color: '#9ca3af', fontSize: 16 },
  chipsRow: { flexDirection: 'row', gap: 6 },
  chip: { backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontSize: 13, color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  dropdown: { backgroundColor: '#fff', borderRadius: 16, maxHeight: 300 },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  optionText: { fontSize: 16, color: '#111827' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from 'react-native';"],
  };
}

// Checkbox
export function generateRNCheckbox(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => !disabled && onChange(!checked)} disabled={disabled}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkboxDisabled: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  label: { fontSize: 16, color: '#374151', marginLeft: 10 },
  labelDisabled: { color: '#9ca3af' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Checkbox Group
export function generateRNCheckboxGroup(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Option { value: string; label: string; }
interface CheckboxGroupProps {
  label?: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function CheckboxGroup({ label, options, values, onChange }: CheckboxGroupProps) {
  const toggle = (val: string) => onChange(values.includes(val) ? values.filter(v => v !== val) : [...values, val]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} style={styles.option} onPress={() => toggle(opt.value)}>
          <View style={[styles.checkbox, values.includes(opt.value) && styles.checkboxChecked]}>
            {values.includes(opt.value) && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.optionLabel}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  groupLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  optionLabel: { fontSize: 16, color: '#374151', marginLeft: 10 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Radio Button
export function generateRNRadioButton(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RadioButtonProps {
  label?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function RadioButton({ label, selected, onSelect, disabled }: RadioButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect} disabled={disabled}>
      <View style={[styles.radio, selected && styles.radioSelected, disabled && styles.radioDisabled]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#3b82f6' },
  radioDisabled: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' },
  label: { fontSize: 16, color: '#374151', marginLeft: 10 },
  labelDisabled: { color: '#9ca3af' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Radio Group
export function generateRNRadioGroup(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Option { value: string; label: string; }
interface RadioGroupProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
}

export default function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} style={styles.option} onPress={() => onChange(opt.value)}>
          <View style={[styles.radio, value === opt.value && styles.radioSelected]}>
            {value === opt.value && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.optionLabel}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  groupLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#3b82f6' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' },
  optionLabel: { fontSize: 16, color: '#374151', marginLeft: 10 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Toggle Switch
export function generateRNToggleSwitch(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface ToggleSwitchProps {
  label?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ label, value, onToggle, disabled }: ToggleSwitchProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.track, value && styles.trackActive, disabled && styles.trackDisabled]}
        onPress={() => !disabled && onToggle(!value)}
        activeOpacity={0.8}
      >
        <View style={[styles.thumb, value && styles.thumbActive]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 16, color: '#374151', flex: 1 },
  labelDisabled: { color: '#9ca3af' },
  track: { width: 52, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', padding: 2, justifyContent: 'center' },
  trackActive: { backgroundColor: '#3b82f6' },
  trackDisabled: { backgroundColor: '#f3f4f6' },
  thumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  thumbActive: { alignSelf: 'flex-end' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';"],
  };
}

// Date Picker
export function generateRNDatePicker(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DatePicker({ label, value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        <Text style={[styles.value, !value && styles.placeholder]}>{value ? formatDate(value) : placeholder}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            <Text style={styles.pickerHint}>Date picker would integrate with @react-native-community/datetimepicker</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => { onChange(new Date()); setVisible(false); }}>
              <Text style={styles.confirmText}>Select Today</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  value: { fontSize: 16, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  pickerHint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  confirmBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  confirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Time Picker
export function generateRNTimePicker(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerProps {
  label?: string;
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export default function TimePicker({ label, value, onChange, placeholder = 'Select time' }: TimePickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <Ionicons name="time-outline" size={20} color="#6b7280" />
        <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>Select Time</Text>
            <View style={styles.quickTimes}>
              {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                <TouchableOpacity key={t} style={[styles.timeBtn, value === t && styles.timeBtnActive]} onPress={() => { onChange(t); setVisible(false); }}>
                  <Text style={[styles.timeText, value === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  value: { fontSize: 16, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' },
  quickTimes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  timeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6' },
  timeBtnActive: { backgroundColor: '#3b82f6' },
  timeText: { fontSize: 14, color: '#374151' },
  timeTextActive: { color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Date Range Picker
export function generateRNDateRangePicker(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateRange { start?: Date; end?: Date; }
interface DateRangePickerProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ label, value, onChange }: DateRangePickerProps) {
  const [visible, setVisible] = useState(false);
  const formatDate = (d?: Date) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text style={[styles.dateText, !value.start && styles.placeholder]}>{formatDate(value.start)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
          <Text style={[styles.dateText, !value.end && styles.placeholder]}>{formatDate(value.end)}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>Select Date Range</Text>
            <TouchableOpacity style={styles.presetBtn} onPress={() => { const today = new Date(); onChange({ start: today, end: new Date(today.getTime() + 7*24*60*60*1000) }); setVisible(false); }}>
              <Text style={styles.presetText}>Next 7 days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => { const today = new Date(); onChange({ start: today, end: new Date(today.getTime() + 30*24*60*60*1000) }); setVisible(false); }}>
              <Text style={styles.presetText}>Next 30 days</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 14, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  pickerTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' },
  presetBtn: { backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  presetText: { fontSize: 16, color: '#374151' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// File Picker / Image Uploader
export function generateRNImageUploader(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageUploaderProps {
  images: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onAdd, onRemove, maxImages = 5 }: ImageUploaderProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={[...images, ...(images.length < maxImages ? ['add'] : [])]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => item === 'add' ? (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Ionicons name="camera" size={28} color="#6b7280" />
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageItem}>
            <Image source={{ uri: item }} style={styles.image} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.hint}>{images.length}/{maxImages} photos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  addBtn: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#f3f4f6', borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  imageItem: { position: 'relative', marginRight: 12 },
  image: { width: 100, height: 100, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';"],
  };
}

// Slider
export function generateRNSlider(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface SliderInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

export default function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, showValue = true }: SliderInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label && <Text style={styles.label}>{label}</Text>}
        {showValue && <Text style={styles.value}>{value}</Text>}
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#3b82f6"
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor="#3b82f6"
      />
      <View style={styles.range}>
        <Text style={styles.rangeText}>{min}</Text>
        <Text style={styles.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  value: { fontSize: 16, fontWeight: '600', color: '#3b82f6' },
  slider: { width: '100%', height: 40 },
  range: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { fontSize: 12, color: '#9ca3af' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';", "import Slider from '@react-native-community/slider';"],
  };
}

// Rating Input / Star Rating
export function generateRNStarRating(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  label?: string;
  value: number;
  onChange?: (value: number) => void;
  maxStars?: number;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ label, value, onChange, maxStars = 5, size = 32, readonly }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => !readonly && onChange?.(i + 1)} disabled={readonly}>
            <Ionicons name={i < value ? 'star' : 'star-outline'} size={size} color="#f59e0b" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Alias for Star Rating
export const generateRNRatingInput = generateRNStarRating;

// Autocomplete
export function generateRNAutocomplete(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function Autocomplete({ label, placeholder, suggestions, value, onChange }: AutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholderTextColor="#9ca3af"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      {focused && filtered.length > 0 && (
        <View style={styles.dropdown}>
          {filtered.slice(0, 5).map((item, i) => (
            <TouchableOpacity key={i} style={styles.suggestion} onPress={() => { onChange(item); setFocused(false); }}>
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, zIndex: 10 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginTop: 4 },
  suggestion: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionText: { fontSize: 16, color: '#111827' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// Tag Input
export function generateRNTagInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagInput({ label, tags, onChange, placeholder = 'Add tag...', maxTags = 10 }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      onChange([...tags, tag]);
      setInput('');
    }
  };

  const removeTag = (index: number) => onChange(tags.filter((_, i) => i !== index));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
          <View style={styles.tagsRow}>
            {tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(i)}><Ionicons name="close" size={14} color="#fff" /></TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
        <TextInput
          style={styles.input}
          placeholder={tags.length < maxTags ? placeholder : ''}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTag}
          editable={tags.length < maxTags}
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputBox: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  tagsScroll: { marginBottom: 4 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, gap: 4 },
  tagText: { fontSize: 13, color: '#fff' },
  input: { paddingVertical: 6, fontSize: 16, color: '#111827' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Phone Input
export function generateRNPhoneInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const countryCodes = [
  { code: '+1', country: 'US', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { code: '+44', country: 'UK', flag: '\ud83c\uddec\ud83c\udde7' },
  { code: '+91', country: 'IN', flag: '\ud83c\uddee\ud83c\uddf3' },
  { code: '+86', country: 'CN', flag: '\ud83c\udde8\ud83c\uddf3' },
];

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (code: string) => void;
}

export default function PhoneInput({ label, value, onChange, countryCode = '+1', onCountryChange }: PhoneInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const selected = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.countryBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.flag}>{selected.flag}</Text>
          <Text style={styles.countryCode}>{selected.code}</Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={value}
          onChangeText={onChange}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowPicker(false)} activeOpacity={1}>
          <View style={styles.picker}>
            <FlatList
              data={countryCodes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryItem} onPress={() => { onCountryChange?.(item.code); setShowPicker(false); }}>
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.country}</Text>
                  <Text style={styles.countryCodeText}>{item.code}</Text>
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
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  countryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: '#e5e7eb', gap: 6 },
  flag: { fontSize: 20 },
  countryCode: { fontSize: 14, color: '#374151' },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 16, color: '#111827' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  picker: { backgroundColor: '#fff', borderRadius: 16, maxHeight: 300 },
  countryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  countryName: { flex: 1, fontSize: 16, color: '#111827' },
  countryCodeText: { fontSize: 14, color: '#6b7280' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';"],
  };
}

// Password Input
export function generateRNPasswordInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showStrength?: boolean;
}

export default function PasswordInput({ label, placeholder = 'Enter password', value, onChangeText, error, showStrength }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const getStrength = () => {
    if (value.length < 6) return { level: 'weak', color: '#ef4444', width: '33%' };
    if (value.length < 10 || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) return { level: 'medium', color: '#f59e0b', width: '66%' };
    return { level: 'strong', color: '#10b981', width: '100%' };
  };

  const strength = getStrength();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity onPress={() => setVisible(!visible)}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
      {showStrength && value.length > 0 && (
        <View style={styles.strengthRow}>
          <View style={styles.strengthBar}>
            <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
          </View>
          <Text style={[styles.strengthText, { color: strength.color }]}>{strength.level}</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  inputError: { borderColor: '#ef4444' },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// OTP / PIN Input
export function generateRNOtpInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export default function OtpInput({ length = 6, value, onChange, label, error }: OtpInputProps) {
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputsRow}>
        {Array.from({ length }).map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => { if (ref) inputs.current[i] = ref; }}
            style={[styles.input, error && styles.inputError, value[i] && styles.inputFilled]}
            value={value[i] || ''}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12, textAlign: 'center' },
  inputsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  input: { width: 48, height: 56, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb', fontSize: 24, fontWeight: '600', textAlign: 'center', color: '#111827' },
  inputError: { borderColor: '#ef4444' },
  inputFilled: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' },
});`,
    imports: ["import React, { useRef, useState } from 'react';", "import { View, Text, TextInput, StyleSheet } from 'react-native';"],
  };
}

// Alias
export const generateRNPinInput = generateRNOtpInput;

// Credit Card Input
export function generateRNCreditCardInput(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreditCardInputProps {
  onCardChange?: (card: { number: string; expiry: string; cvv: string; name: string }) => void;
}

export default function CreditCardInput({ onCardChange }: CreditCardInputProps) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatNumber = (val: string) => {
    const digits = val.replace(/\\D/g, '').slice(0, 16);
    return digits.replace(/(\\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleNumberChange = (val: string) => {
    const formatted = formatNumber(val);
    setNumber(formatted);
    onCardChange?.({ number: formatted, expiry, cvv, name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardPreview}>
        <Ionicons name="card" size={32} color="#fff" />
        <Text style={styles.previewNumber}>{number || '**** **** **** ****'}</Text>
        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>{name || 'CARD HOLDER'}</Text>
          <Text style={styles.previewLabel}>{expiry || 'MM/YY'}</Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput style={styles.input} placeholder="1234 5678 9012 3456" value={number} onChangeText={handleNumberChange} keyboardType="number-pad" maxLength={19} placeholderTextColor="#9ca3af" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} autoCapitalize="characters" placeholderTextColor="#9ca3af" />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Expiry</Text>
          <TextInput style={styles.input} placeholder="MM/YY" value={expiry} onChangeText={(v) => setExpiry(formatExpiry(v))} keyboardType="number-pad" maxLength={5} placeholderTextColor="#9ca3af" />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput style={styles.input} placeholder="123" value={cvv} onChangeText={(v) => setCvv(v.replace(/\\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry maxLength={4} placeholderTextColor="#9ca3af" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  cardPreview: { backgroundColor: '#1e3a5f', borderRadius: 16, padding: 20, marginBottom: 20 },
  previewNumber: { fontSize: 20, fontWeight: '600', color: '#fff', letterSpacing: 2, marginTop: 20 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  previewLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', gap: 12 },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, StyleSheet } from 'react-native';"],
  };
}

// Contact Form
export function generateRNContactForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; subject: string; message: string }) => void;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; subject: string; message: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/contact\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact'] });
      if (onSubmit) onSubmit({ name, email, subject, message });
      Alert.alert('Success', 'Message sent successfully');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to send message');
    },
  });

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    submitMutation.mutate({ name, email, subject, message });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color="#6b7280" />
          <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} placeholderTextColor="#9ca3af" editable={!submitMutation.isPending} />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#6b7280" />
          <TextInput style={styles.input} placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" editable={!submitMutation.isPending} />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.inputFull} placeholder="What is this about?" value={subject} onChangeText={setSubject} placeholderTextColor="#9ca3af" editable={!submitMutation.isPending} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.inputFull, styles.textArea]} placeholder="Your message..." value={message} onChangeText={setMessage} multiline numberOfLines={5} textAlignVertical="top" placeholderTextColor="#9ca3af" editable={!submitMutation.isPending} />
      </View>

      <TouchableOpacity style={[styles.submitBtn, submitMutation.isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitMutation.isPending}>
        {submitMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.submitText}>Send Message</Text>
            <Ionicons name="send" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  inputFull: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  textArea: { minHeight: 120 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, gap: 8, marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Subscribe Form
export function generateRNSubscribeForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SubscribeFormProps {
  onSubscribe?: (email: string) => void;
  title?: string;
  description?: string;
}

export default function SubscribeForm({ onSubscribe, title = 'Stay Updated', description = 'Get the latest news and updates' }: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/subscribe\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
      });
      if (!response.ok) throw new Error('Failed to subscribe');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      if (onSubscribe) onSubscribe(email);
      setSubscribed(true);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to subscribe');
    },
  });

  const handleSubscribe = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    subscribeMutation.mutate(email);
  };

  if (subscribed) {
    return (
      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
        </View>
        <Text style={styles.successTitle}>You're subscribed!</Text>
        <Text style={styles.successText}>Thanks for subscribing to our newsletter.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={20} color="#6b7280" />
        <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" editable={!subscribeMutation.isPending} />
      </View>
      <TouchableOpacity style={[styles.subscribeBtn, subscribeMutation.isPending && styles.subscribeBtnDisabled]} onPress={handleSubscribe} disabled={subscribeMutation.isPending}>
        {subscribeMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.subscribeBtnText}>Subscribe</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 10, width: '100%' },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111827' },
  subscribeBtn: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 12 },
  subscribeBtnDisabled: { backgroundColor: '#93c5fd' },
  subscribeBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  successText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Feedback Form
export function generateRNFeedbackForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FeedbackFormProps {
  onSubmit?: (data: { rating: number; feedback: string; category: string }) => void;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const queryClient = useQueryClient();

  const categories = ['Bug Report', 'Feature Request', 'General Feedback', 'Other'];

  const submitMutation = useMutation({
    mutationFn: async (data: { rating: number; feedback: string; category: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/feedback\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      if (onSubmit) onSubmit({ rating, feedback, category });
      Alert.alert('Success', 'Thank you for your feedback!');
      setRating(0);
      setFeedback('');
      setCategory('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to submit feedback');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!feedback) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }
    submitMutation.mutate({ rating, feedback, category });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Share Your Feedback</Text>

      <Text style={styles.label}>How would you rate your experience?</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => !submitMutation.isPending && setRating(star)} disabled={submitMutation.isPending}>
            <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={36} color="#f59e0b" />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]} onPress={() => !submitMutation.isPending && setCategory(cat)} disabled={submitMutation.isPending}>
            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Feedback</Text>
      <TextInput style={styles.textArea} placeholder="Tell us what you think..." value={feedback} onChangeText={setFeedback} multiline numberOfLines={5} textAlignVertical="top" placeholderTextColor="#9ca3af" editable={!submitMutation.isPending} />

      <TouchableOpacity style={[styles.submitBtn, submitMutation.isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitMutation.isPending}>
        {submitMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Feedback</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f3f4f6' },
  categoryBtnActive: { backgroundColor: '#3b82f6' },
  categoryText: { fontSize: 14, color: '#374151' },
  categoryTextActive: { color: '#fff' },
  textArea: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', minHeight: 120, marginBottom: 20 },
  submitBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Form Wizard / Multi Step Form
export function generateRNFormWizard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step { title: string; content: React.ReactNode; }
interface FormWizardProps {
  steps: Step[];
  onComplete?: () => void;
}

export default function FormWizard({ steps, onComplete }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onComplete?.();
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepIndicator}>
            <View style={[styles.stepCircle, i <= currentStep && styles.stepCircleActive]}>
              {i < currentStep ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={[styles.stepNumber, i <= currentStep && styles.stepNumberActive]}>{i + 1}</Text>}
            </View>
            {i < steps.length - 1 && <View style={[styles.stepLine, i < currentStep && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {steps[currentStep].content}
      </ScrollView>

      <View style={styles.actions}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextText}>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</Text>
          <Ionicons name={currentStep === steps.length - 1 ? 'checkmark' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: '#3b82f6' },
  stepNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  stepNumberActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: '#3b82f6' },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 20 },
  content: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#f3f4f6', gap: 8 },
  backText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#3b82f6', gap: 8, flex: 1, justifyContent: 'center', marginLeft: 12 },
  nextText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Alias
export const generateRNMultiStepForm = generateRNFormWizard;

// Address Form
export function generateRNAddressForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface AddressFormProps {
  onSubmit?: (address: any) => void;
  initialValues?: any;
}

export default function AddressForm({ onSubmit, initialValues = {} }: AddressFormProps) {
  const [address, setAddress] = useState({
    street: initialValues.street || '',
    apartment: initialValues.apartment || '',
    city: initialValues.city || '',
    state: initialValues.state || '',
    zipCode: initialValues.zipCode || '',
    country: initialValues.country || '',
  });

  const updateField = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.field}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput style={styles.input} placeholder="123 Main St" value={address.street} onChangeText={(v) => updateField('street', v)} placeholderTextColor="#9ca3af" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Apartment, Suite, etc. (optional)</Text>
        <TextInput style={styles.input} placeholder="Apt 4B" value={address.apartment} onChangeText={(v) => updateField('apartment', v)} placeholderTextColor="#9ca3af" />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} placeholder="City" value={address.city} onChangeText={(v) => updateField('city', v)} placeholderTextColor="#9ca3af" />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>State</Text>
          <TextInput style={styles.input} placeholder="State" value={address.state} onChangeText={(v) => updateField('state', v)} placeholderTextColor="#9ca3af" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>ZIP Code</Text>
          <TextInput style={styles.input} placeholder="12345" value={address.zipCode} onChangeText={(v) => updateField('zipCode', v)} keyboardType="number-pad" placeholderTextColor="#9ca3af" />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Country</Text>
          <TextInput style={styles.input} placeholder="Country" value={address.country} onChangeText={(v) => updateField('country', v)} placeholderTextColor="#9ca3af" />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={() => onSubmit?.(address)}>
        <Text style={styles.submitText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', gap: 12 },
  submitBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Shipping Address Form
export const generateRNShippingAddressForm = generateRNAddressForm;

// Billing Address Form
export const generateRNBillingAddressForm = generateRNAddressForm;

// Survey Form
export function generateRNSurveyForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  scale?: { min: number; max: number; labels?: { min: string; max: string } };
}

interface SurveyFormProps {
  questions: Question[];
  onSubmit?: (answers: Record<string, any>) => void;
}

export default function SurveyForm({ questions, onSubmit }: SurveyFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const question = questions[currentIndex];

  const setAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    else onSubmit?.(answers);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: \`\${((currentIndex + 1) / questions.length) * 100}%\` }]} />
      </View>
      <Text style={styles.counter}>{currentIndex + 1} of {questions.length}</Text>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{question.text}</Text>

        {question.type === 'single' && question.options?.map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.option, answers[question.id] === opt && styles.optionSelected]} onPress={() => setAnswer(opt)}>
            <View style={[styles.radio, answers[question.id] === opt && styles.radioSelected]}>
              {answers[question.id] === opt && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}

        {question.type === 'scale' && (
          <View style={styles.scaleRow}>
            {Array.from({ length: (question.scale?.max || 10) - (question.scale?.min || 1) + 1 }).map((_, i) => {
              const val = (question.scale?.min || 1) + i;
              return (
                <TouchableOpacity key={val} style={[styles.scaleBtn, answers[question.id] === val && styles.scaleBtnSelected]} onPress={() => setAnswer(val)}>
                  <Text style={[styles.scaleText, answers[question.id] === val && styles.scaleTextSelected]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.nextBtn, !answers[question.id] && styles.nextBtnDisabled]} onPress={next} disabled={!answers[question.id]}>
        <Text style={styles.nextText}>{currentIndex === questions.length - 1 ? 'Submit' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  progress: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 },
  counter: { fontSize: 12, color: '#6b7280', marginBottom: 24 },
  content: { flex: 1 },
  questionText: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#3b82f6' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6' },
  optionText: { fontSize: 16, color: '#111827' },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  scaleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  scaleBtnSelected: { backgroundColor: '#3b82f6' },
  scaleText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  scaleTextSelected: { color: '#fff' },
  nextBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  nextBtnDisabled: { backgroundColor: '#9ca3af' },
  nextText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Poll Widget
export function generateRNPollWidget(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PollOption { id: string; text: string; votes: number; }
interface PollWidgetProps {
  question: string;
  options: PollOption[];
  onVote?: (optionId: string) => void;
  totalVotes?: number;
}

export default function PollWidget({ question, options, onVote, totalVotes: initialTotal }: PollWidgetProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const totalVotes = initialTotal || options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (id: string) => {
    if (!voted) {
      setVoted(id);
      onVote?.(id);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {options.map((option) => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        const isSelected = voted === option.id;

        return (
          <TouchableOpacity key={option.id} style={[styles.option, isSelected && styles.optionSelected]} onPress={() => handleVote(option.id)} disabled={!!voted}>
            {voted && <View style={[styles.progressBar, { width: \`\${percentage}%\` }]} />}
            <Text style={styles.optionText}>{option.text}</Text>
            {voted && <Text style={styles.percentage}>{percentage}%</Text>}
          </TouchableOpacity>
        );
      })}
      <Text style={styles.totalVotes}>{totalVotes} votes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  question: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  option: { position: 'relative', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#f3f4f6', borderRadius: 12, marginBottom: 10, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionSelected: { borderWidth: 2, borderColor: '#3b82f6' },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#dbeafe', borderRadius: 12 },
  optionText: { fontSize: 16, color: '#111827', zIndex: 1 },
  percentage: { fontSize: 14, fontWeight: '600', color: '#3b82f6', zIndex: 1 },
  totalVotes: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Inline Edit
export function generateRNInlineEdit(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}

export default function InlineEdit({ value, onSave, placeholder = 'Click to edit' }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleSave = () => {
    onSave(text);
    setEditing(false);
  };

  const handleCancel = () => {
    setText(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={styles.editRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText} autoFocus />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.display} onPress={() => setEditing(true)}>
      <Text style={[styles.text, !value && styles.placeholder]}>{value || placeholder}</Text>
      <Ionicons name="pencil" size={16} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  display: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f9fafb', borderRadius: 12 },
  text: { fontSize: 16, color: '#111827' },
  placeholder: { color: '#9ca3af' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#111827', borderWidth: 2, borderColor: '#3b82f6' },
  saveBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// ============================================================================
// FALLBACK ALIASES - Map expected registry names to existing generators
// ============================================================================

// Generic form fallbacks
export const generateRNForm = generateRNContactForm;
export const generateRNApplicationForm = generateRNContactForm;
export const generateRNBookingForm = generateRNContactForm;
export const generateRNCreditCardForm = generateRNCreditCardInput;
export const generateRNWriteReviewForm = generateRNFeedbackForm;
export const generateRNNewsletterSignup = generateRNSubscribeForm;
export const generateRNWizardForm = generateRNFormWizard;
export const generateRNMultiColumnForm = generateRNFormWizard;
export const generateRNInlineForm = generateRNInlineEdit;

// Form field fallbacks
export const generateRNFormFieldEmail = generateRNTextInput;
export const generateRNFormFieldPassword = generateRNPasswordInput;
export const generateRNFormFieldText = generateRNTextInput;
export const generateRNInput = generateRNTextInput;
export const generateRNTextarea = generateRNTextArea;
export const generateRNLabel = generateRNTextInput;

// Date/Time picker fallbacks
export const generateRNDatePickerSingle = generateRNDatePicker;
export const generateRNDatePickerRange = generateRNDateRangePicker;
export const generateRNDatetimePicker = generateRNDatePicker;

// File upload fallbacks
export const generateRNColorPicker = generateRNSelectDropdown;
export const generateRNFileUploadSingle = generateRNImageUploader;
export const generateRNFileUploadMultiple = generateRNImageUploader;
export const generateRNImageUploadPreview = generateRNImageUploader;
export const generateRNMediaUploadPreview = generateRNImageUploader;

// Autocomplete fallbacks
export const generateRNAutocompleteInput = generateRNAutocomplete;
export const generateRNAddressAutocomplete = generateRNAutocomplete;
export const generateRNPhoneNumberInput = generateRNPhoneInput;

// Selector fallbacks
export const generateRNCurrencySelector = generateRNSelectDropdown;
export const generateRNLanguageSelector = generateRNSelectDropdown;
export const generateRNShippingMethodSelector = generateRNSelectDropdown;
export const generateRNSizeVariantSelector = generateRNSelectDropdown;

// Rating/Range fallbacks
export const generateRNRatingInputStars = generateRNStarRating;
export const generateRNRatingInputNumbers = generateRNStarRating;
export const generateRNSliderRange = generateRNSlider;
export const generateRNPriceRangeSlider = generateRNSlider;

// Advanced input fallbacks
export const generateRNEmojiPicker = generateRNSelectDropdown;
export const generateRNMarkdownEditor = generateRNTextArea;
export const generateRNCodeEditor = generateRNTextArea;
export const generateRNSignaturePad = generateRNTextInput;
export const generateRNPromoCodeInput = generateRNTextInput;
export const generateRNCaptchaIntegration = generateRNTextInput;
export const generateRNFormProgressIndicator = generateRNFormWizard;
export const generateRNFormValidationMessages = generateRNTextInput;
export const generateRNBulkActionsToolbar = generateRNCheckboxGroup;

// Common re-export
export { generateRNButton } from '../common/button.generator';
