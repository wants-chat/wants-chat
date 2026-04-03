/**
 * Widget Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Toast Notification
export function generateRNToastNotification(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function ToastNotification({ message, type = 'info', duration = 3000, onClose }: ToastNotificationProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onClose?.());
  }, []);

  const config = {
    success: { icon: 'checkmark-circle', color: '#10b981', bg: '#d1fae5' },
    error: { icon: 'alert-circle', color: '#ef4444', bg: '#fee2e2' },
    warning: { icon: 'warning', color: '#f59e0b', bg: '#fef3c7' },
    info: { icon: 'information-circle', color: '#3b82f6', bg: '#dbeafe' },
  }[type];

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: config.bg }]}>
      <Ionicons name={config.icon as any} size={24} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color={config.color} /></TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, margin: 16, gap: 12 },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
});`,
    imports: ["import React, { useEffect } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';"],
  };
}

// Notification List
export function generateRNNotificationList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Notification { id: string; title: string; message: string; time: string; read: boolean; type?: string; }
interface NotificationListProps { notifications: Notification[]; onPress?: (n: Notification) => void; onMarkRead?: (id: string) => void; }

export default function NotificationList({ notifications, onPress, onMarkRead }: NotificationListProps) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={[styles.item, !item.read && styles.unread]} onPress={() => onPress?.(item)}>
          <View style={styles.icon}><Ionicons name="notifications" size={20} color="#3b82f6" /></View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No notifications</Text></View>}
    />
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  unread: { backgroundColor: '#eff6ff' },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  message: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Notification Center Panel
export function generateRNNotificationCenterPanel(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNNotificationList(resolved, variant);
}

// Alert Banner
export function generateRNAlertBanner(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertBannerProps { message: string; type?: 'info' | 'warning' | 'error' | 'success'; onDismiss?: () => void; action?: { label: string; onPress: () => void }; }

export default function AlertBanner({ message, type = 'info', onDismiss, action }: AlertBannerProps) {
  const config = { info: { bg: '#dbeafe', color: '#1e40af', icon: 'information-circle' }, warning: { bg: '#fef3c7', color: '#92400e', icon: 'warning' }, error: { bg: '#fee2e2', color: '#991b1b', icon: 'alert-circle' }, success: { bg: '#d1fae5', color: '#065f46', icon: 'checkmark-circle' } }[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      {action && <TouchableOpacity onPress={action.onPress}><Text style={[styles.action, { color: config.color }]}>{action.label}</Text></TouchableOpacity>}
      {onDismiss && <TouchableOpacity onPress={onDismiss}><Ionicons name="close" size={20} color={config.color} /></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  message: { flex: 1, fontSize: 14 },
  action: { fontWeight: '600', fontSize: 14 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// System Notifications
export function generateRNSystemNotifications(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNNotificationList(resolved, variant);
}

// Push Notification Prompt
export function generateRNPushNotificationPrompt(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PushNotificationPromptProps { visible: boolean; onAllow?: () => void; onDeny?: () => void; }

export default function PushNotificationPrompt({ visible, onAllow, onDeny }: PushNotificationPromptProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconCircle}><Ionicons name="notifications" size={40} color="#3b82f6" /></View>
          <Text style={styles.title}>Enable Notifications</Text>
          <Text style={styles.message}>Stay updated with important alerts and updates</Text>
          <TouchableOpacity style={styles.allowButton} onPress={onAllow}><Text style={styles.allowText}>Enable Notifications</Text></TouchableOpacity>
          <TouchableOpacity style={styles.denyButton} onPress={onDeny}><Text style={styles.denyText}>Not Now</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  message: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  allowButton: { width: '100%', backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  allowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  denyButton: { padding: 12 },
  denyText: { color: '#6b7280', fontSize: 14 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Calendar
export function generateRNCalendar(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarProps { selectedDate?: Date; onDateSelect?: (date: Date) => void; events?: { date: string; count: number }[]; }

export default function Calendar({ selectedDate = new Date(), onDateSelect, events = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: 42 }, (_, i) => i < firstDay ? null : i - firstDay + 1 <= daysInMonth ? i - firstDay + 1 : null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <View style={styles.daysRow}>{days.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}</View>
      <View style={styles.datesGrid}>
        {dates.map((date, i) => (
          <TouchableOpacity key={i} style={[styles.dateCell, date === selectedDate.getDate() && styles.selected]} onPress={() => date && onDateSelect?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date))}>
            <Text style={[styles.dateText, date === selectedDate.getDate() && styles.selectedText]}>{date || ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthYear: { fontSize: 18, fontWeight: '600', color: '#111827' },
  daysRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '500', color: '#6b7280' },
  datesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: '#3b82f6', borderRadius: 20 },
  dateText: { fontSize: 14, color: '#111827' },
  selectedText: { color: '#fff', fontWeight: '600' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Calendar Event
export function generateRNCalendarEvent(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarEventProps { title: string; time: string; location?: string; color?: string; onPress?: () => void; }

export default function CalendarEvent({ title, time, location, color = '#3b82f6', onPress }: CalendarEventProps) {
  return (
    <TouchableOpacity style={[styles.container, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}><Ionicons name="time-outline" size={14} color="#6b7280" /><Text style={styles.detail}>{time}</Text></View>
      {location && <View style={styles.row}><Ionicons name="location-outline" size={14} color="#6b7280" /><Text style={styles.detail}>{location}</Text></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderLeftWidth: 4, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  detail: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Kanban Board
export function generateRNKanbanBoard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Card { id: string; title: string; description?: string; }
interface Column { id: string; title: string; cards: Card[]; }
interface KanbanBoardProps { columns: Column[]; onCardPress?: (card: Card) => void; onAddCard?: (columnId: string) => void; }

export default function KanbanBoard({ columns, onCardPress, onAddCard }: KanbanBoardProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {columns.map(column => (
        <View key={column.id} style={styles.column}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>{column.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{column.cards.length}</Text></View>
          </View>
          <ScrollView style={styles.cardsList}>
            {column.cards.map(card => (
              <TouchableOpacity key={card.id} style={styles.card} onPress={() => onCardPress?.(card)}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                {card.description && <Text style={styles.cardDesc} numberOfLines={2}>{card.description}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.addButton} onPress={() => onAddCard?.(column.id)}>
            <Ionicons name="add" size={20} color="#6b7280" /><Text style={styles.addText}>Add Card</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  column: { width: 280, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  columnTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  cardsList: { maxHeight: 400 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4 },
  addText: { fontSize: 14, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Whiteboard Interface
export function generateRNWhiteboardInterface(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNDrawingCanvas(resolved, variant);
}

// Drawing Canvas
export function generateRNDrawingCanvas(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrawingCanvasProps { onSave?: () => void; onClear?: () => void; }

export default function DrawingCanvas({ onSave, onClear }: DrawingCanvasProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.tool}><Ionicons name="pencil" size={24} color="#111827" /></TouchableOpacity>
        <TouchableOpacity style={styles.tool}><Ionicons name="brush" size={24} color="#111827" /></TouchableOpacity>
        <TouchableOpacity style={styles.tool}><Ionicons name="color-palette" size={24} color="#111827" /></TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.tool} onPress={onClear}><Ionicons name="trash" size={24} color="#ef4444" /></TouchableOpacity>
        <TouchableOpacity style={[styles.tool, styles.saveButton]} onPress={onSave}><Ionicons name="save" size={24} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.canvas}><Text style={styles.hint}>Drawing canvas area</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toolbar: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 8 },
  tool: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  saveButton: { backgroundColor: '#3b82f6' },
  spacer: { flex: 1 },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  hint: { fontSize: 16, color: '#9ca3af' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Interactive Demo
export function generateRNInteractiveDemo(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step { id: string; title: string; content: string; }
interface InteractiveDemoProps { steps: Step[]; onComplete?: () => void; }

export default function InteractiveDemo({ steps, onComplete }: InteractiveDemoProps) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  return (
    <View style={styles.container}>
      <View style={styles.progress}>{steps.map((_, i) => <View key={i} style={[styles.dot, i <= current && styles.dotActive]} />)}</View>
      <Text style={styles.title}>{step?.title}</Text>
      <Text style={styles.content}>{step?.content}</Text>
      <View style={styles.buttons}>
        {current > 0 && <TouchableOpacity style={styles.backButton} onPress={() => setCurrent(current - 1)}><Text style={styles.backText}>Back</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.nextButton} onPress={() => current < steps.length - 1 ? setCurrent(current + 1) : onComplete?.()}>
          <Text style={styles.nextText}>{current === steps.length - 1 ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', borderRadius: 16 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
  dotActive: { backgroundColor: '#3b82f6', width: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 12 },
  content: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12 },
  backButton: { flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  nextButton: { flex: 1, paddingVertical: 14, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' },
  nextText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// QR Code Generator
export function generateRNQrCodeGenerator(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QrCodeGeneratorProps { onGenerate?: (value: string) => void; }

export default function QrCodeGenerator({ onGenerate }: QrCodeGeneratorProps) {
  const [value, setValue] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.preview}><Ionicons name="qr-code" size={120} color="#d1d5db" /><Text style={styles.previewText}>QR Code Preview</Text></View>
      <TextInput style={styles.input} value={value} onChangeText={setValue} placeholder="Enter URL or text" />
      <TouchableOpacity style={styles.button} onPress={() => onGenerate?.(value)}>
        <Ionicons name="create" size={20} color="#fff" /><Text style={styles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', borderRadius: 16 },
  preview: { alignItems: 'center', padding: 40, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 20 },
  previewText: { fontSize: 14, color: '#9ca3af', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 8, gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// QR Code Scanner
export function generateRNQrCodeScanner(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QrCodeScannerProps { onScan?: (data: string) => void; onClose?: () => void; }

export default function QrCodeScanner({ onScan, onClose }: QrCodeScannerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
      <View style={styles.scanArea}><View style={styles.corner} /><View style={[styles.corner, styles.topRight]} /><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} /></View>
      <Text style={styles.hint}>Point your camera at a QR code</Text>
      <TouchableOpacity style={styles.galleryButton}><Ionicons name="images" size={20} color="#fff" /><Text style={styles.galleryText}>Choose from Gallery</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20 },
  scanArea: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3b82f6', borderTopWidth: 4, borderLeftWidth: 4, top: 0, left: 0 },
  topRight: { borderLeftWidth: 0, borderRightWidth: 4, left: undefined, right: 0 },
  bottomLeft: { borderTopWidth: 0, borderBottomWidth: 4, top: undefined, bottom: 0 },
  bottomRight: { borderTopWidth: 0, borderBottomWidth: 4, borderLeftWidth: 0, borderRightWidth: 4, top: undefined, bottom: 0, left: undefined, right: 0 },
  hint: { color: '#fff', fontSize: 16, marginTop: 32 },
  galleryButton: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  galleryText: { color: '#fff', fontSize: 14 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// QR Scanner (alias)
export function generateRNQrScanner(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNQrCodeScanner(resolved, variant);
}

// Progress Indicator Linear
export function generateRNProgressIndicatorLinear(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorLinearProps { progress: number; label?: string; showPercentage?: boolean; color?: string; }

export default function ProgressIndicatorLinear({ progress, label, showPercentage = true, color = '#3b82f6' }: ProgressIndicatorLinearProps) {
  const percent = Math.min(100, Math.max(0, progress));
  return (
    <View style={styles.container}>
      {(label || showPercentage) && <View style={styles.header}><Text style={styles.label}>{label}</Text>{showPercentage && <Text style={styles.percentage}>{percent}%</Text>}</View>}
      <View style={styles.track}><View style={[styles.bar, { width: \`\${percent}%\`, backgroundColor: color }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  percentage: { fontSize: 14, fontWeight: '600', color: '#111827' },
  track: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Progress Indicator Circular
export function generateRNProgressIndicatorCircular(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorCircularProps { progress: number; size?: number; strokeWidth?: number; color?: string; label?: string; }

export default function ProgressIndicatorCircular({ progress, size = 100, strokeWidth = 8, color = '#3b82f6', label }: ProgressIndicatorCircularProps) {
  const percent = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { borderWidth: strokeWidth, borderColor: '#e5e7eb' }]} />
      <View style={styles.content}><Text style={styles.percentage}>{percent}%</Text>{label && <Text style={styles.label}>{label}</Text>}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', width: '100%', height: '100%', borderRadius: 999 },
  content: { alignItems: 'center' },
  percentage: { fontSize: 24, fontWeight: '700', color: '#111827' },
  label: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Roadmap Timeline
export function generateRNRoadmapTimeline(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Milestone { id: string; title: string; description: string; date: string; status: 'completed' | 'current' | 'upcoming'; }
interface RoadmapTimelineProps { milestones: Milestone[]; }

export default function RoadmapTimeline({ milestones }: RoadmapTimelineProps) {
  const getConfig = (status: string) => ({ completed: { color: '#10b981', icon: 'checkmark-circle' }, current: { color: '#3b82f6', icon: 'ellipse' }, upcoming: { color: '#d1d5db', icon: 'ellipse-outline' } }[status] || { color: '#d1d5db', icon: 'ellipse-outline' });

  return (
    <ScrollView style={styles.container}>
      {milestones.map((m, i) => {
        const config = getConfig(m.status);
        return (
          <View key={m.id} style={styles.item}>
            <View style={styles.timeline}><View style={[styles.dot, { backgroundColor: config.color }]}><Ionicons name={config.icon as any} size={16} color="#fff" /></View>{i < milestones.length - 1 && <View style={styles.line} />}</View>
            <View style={styles.content}><Text style={styles.date}>{m.date}</Text><Text style={styles.title}>{m.title}</Text><Text style={styles.description}>{m.description}</Text></View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  item: { flexDirection: 'row', marginBottom: 24 },
  timeline: { alignItems: 'center', marginRight: 16 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, backgroundColor: '#e5e7eb', marginTop: 4 },
  content: { flex: 1 },
  date: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Status Badge
export function generateRNStatusBadge(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps { status: string; type?: 'success' | 'warning' | 'error' | 'info' | 'default'; size?: 'small' | 'medium' | 'large'; }

export default function StatusBadge({ status, type = 'default', size = 'medium' }: StatusBadgeProps) {
  const colors = { success: { bg: '#d1fae5', text: '#065f46' }, warning: { bg: '#fef3c7', text: '#92400e' }, error: { bg: '#fee2e2', text: '#991b1b' }, info: { bg: '#dbeafe', text: '#1e40af' }, default: { bg: '#f3f4f6', text: '#374151' } }[type];
  const sizes = { small: { padding: 4, paddingHorizontal: 8, fontSize: 10 }, medium: { padding: 6, paddingHorizontal: 12, fontSize: 12 }, large: { padding: 8, paddingHorizontal: 16, fontSize: 14 } }[size];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, paddingVertical: sizes.padding, paddingHorizontal: sizes.paddingHorizontal }]}>
      <Text style={[styles.text, { color: colors.text, fontSize: sizes.fontSize }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Tooltip System
export function generateRNTooltipSystem(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface TooltipSystemProps { children: React.ReactNode; content: string; position?: 'top' | 'bottom'; }

export default function TooltipSystem({ children, content, position = 'top' }: TooltipSystemProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(!visible)}>{children}</TouchableOpacity>
      {visible && (
        <View style={[styles.tooltip, position === 'bottom' ? styles.tooltipBottom : styles.tooltipTop]}>
          <Text style={styles.tooltipText}>{content}</Text>
          <View style={[styles.arrow, position === 'bottom' ? styles.arrowTop : styles.arrowBottom]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: { position: 'absolute', backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, maxWidth: 200 },
  tooltipTop: { bottom: '100%', marginBottom: 8 },
  tooltipBottom: { top: '100%', marginTop: 8 },
  tooltipText: { color: '#fff', fontSize: 13, textAlign: 'center' },
  arrow: { position: 'absolute', left: '50%', marginLeft: -6, borderWidth: 6, borderColor: 'transparent' },
  arrowBottom: { top: '100%', borderTopColor: '#111827' },
  arrowTop: { bottom: '100%', borderBottomColor: '#111827' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Skeleton Screen
export function generateRNSkeletonScreen(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonScreenProps { rows?: number; avatar?: boolean; }

export default function SkeletonScreen({ rows = 3, avatar = true }: SkeletonScreenProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <Animated.View key={i} style={[styles.row, { opacity }]}>
          {avatar && <View style={styles.avatar} />}
          <View style={styles.content}><View style={styles.title} /><View style={styles.subtitle} /></View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb', marginRight: 12 },
  content: { flex: 1, justifyContent: 'center' },
  title: { height: 16, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '70%' },
  subtitle: { height: 12, backgroundColor: '#e5e7eb', borderRadius: 4, width: '50%' },
});`,
    imports: ["import React, { useEffect, useRef } from 'react';", "import { View, StyleSheet, Animated } from 'react-native';"],
  };
}

// Loading State Spinner
export function generateRNLoadingStateSpinner(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingStateSpinnerProps { message?: string; size?: 'small' | 'large'; color?: string; }

export default function LoadingStateSpinner({ message = 'Loading...', size = 'large', color = '#3b82f6' }: LoadingStateSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  message: { marginTop: 16, fontSize: 16, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';"],
  };
}

// Empty State No Data
export function generateRNEmptyStateNoData(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateNoDataProps { title?: string; message?: string; icon?: string; action?: { label: string; onPress: () => void }; }

export default function EmptyStateNoData({ title = 'No data found', message = 'There is nothing to display at the moment.', icon = 'file-tray-outline', action }: EmptyStateNoDataProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}><Ionicons name={icon as any} size={48} color="#9ca3af" /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && <TouchableOpacity style={styles.button} onPress={action.onPress}><Text style={styles.buttonText}>{action.label}</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 8 },
  message: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Search Results Page
export function generateRNSearchResultsPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Result { id: string; title: string; description: string; type?: string; }
interface SearchResultsPageProps { query: string; results: Result[]; onResultPress?: (result: Result) => void; }

export default function SearchResultsPage({ query, results, onResultPress }: SearchResultsPageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Results for "{query}"</Text>
      <Text style={styles.count}>{results.length} results found</Text>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.result} onPress={() => onResultPress?.(item)}>
            <View style={styles.icon}><Ionicons name="document-text" size={20} color="#3b82f6" /></View>
            <View style={styles.content}><Text style={styles.title}>{item.title}</Text><Text style={styles.description} numberOfLines={2}>{item.description}</Text></View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No results found</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: '600', color: '#111827', padding: 16, paddingBottom: 4 },
  count: { fontSize: 14, color: '#6b7280', paddingHorizontal: 16, paddingBottom: 16 },
  result: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  icon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '500', color: '#111827' },
  description: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Theme Toggle
export function generateRNThemeToggle(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleProps { isDark?: boolean; onToggle?: (isDark: boolean) => void; }

export default function ThemeToggle({ isDark = false, onToggle }: ThemeToggleProps) {
  const [dark, setDark] = useState(isDark);
  const toggle = () => { setDark(!dark); onToggle?.(!dark); };

  return (
    <TouchableOpacity style={[styles.container, dark && styles.containerDark]} onPress={toggle}>
      <View style={[styles.track, dark && styles.trackDark]}><View style={[styles.thumb, dark && styles.thumbDark]}><Ionicons name={dark ? 'moon' : 'sunny'} size={16} color={dark ? '#3b82f6' : '#f59e0b'} /></View></View>
      <Text style={[styles.label, dark && styles.labelDark]}>{dark ? 'Dark' : 'Light'} Mode</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, gap: 12 },
  containerDark: { backgroundColor: '#1f2937' },
  track: { width: 52, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', padding: 2 },
  trackDark: { backgroundColor: '#374151' },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  thumbDark: { marginLeft: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  labelDark: { color: '#f3f4f6' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Cookie Consent Simple
export function generateRNCookieConsentSimple(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CookieConsentSimpleProps { onAccept?: () => void; onDecline?: () => void; }

export default function CookieConsentSimple({ onAccept, onDecline }: CookieConsentSimpleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.declineButton} onPress={onDecline}><Text style={styles.declineText}>Decline</Text></TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1f2937', padding: 16, borderRadius: 12 },
  message: { fontSize: 14, color: '#d1d5db', marginBottom: 16, lineHeight: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  declineButton: { paddingVertical: 8, paddingHorizontal: 16 },
  declineText: { fontSize: 14, color: '#9ca3af' },
  acceptButton: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  acceptText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Cookie Consent Detailed
export function generateRNCookieConsentDetailed(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNCookieConsentSimple(resolved, variant);
}

// Font Size Adjuster
export function generateRNFontSizeAdjuster(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FontSizeAdjusterProps { initialSize?: number; minSize?: number; maxSize?: number; onChange?: (size: number) => void; }

export default function FontSizeAdjuster({ initialSize = 16, minSize = 12, maxSize = 24, onChange }: FontSizeAdjusterProps) {
  const [size, setSize] = useState(initialSize);
  const adjust = (delta: number) => { const newSize = Math.max(minSize, Math.min(maxSize, size + delta)); setSize(newSize); onChange?.(newSize); };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Text Size</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => adjust(-2)} disabled={size <= minSize}><Ionicons name="remove" size={20} color={size <= minSize ? '#d1d5db' : '#374151'} /></TouchableOpacity>
        <Text style={styles.size}>{size}px</Text>
        <TouchableOpacity style={styles.button} onPress={() => adjust(2)} disabled={size >= maxSize}><Ionicons name="add" size={20} color={size >= maxSize ? '#d1d5db' : '#374151'} /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  label: { fontSize: 16, fontWeight: '500', color: '#374151' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  size: { fontSize: 16, fontWeight: '600', color: '#111827', minWidth: 50, textAlign: 'center' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// High Contrast Mode
export function generateRNHighContrastMode(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNThemeToggle(resolved, variant);
}

// Screen Reader Announcements
export function generateRNScreenReaderAnnouncements(resolved: ResolvedComponent, variant: string = 'minimal') {
  return { code: `import React from 'react'; import { AccessibilityInfo, View, Text, StyleSheet } from 'react-native'; export default function ScreenReaderAnnouncements({ message }: { message: string }) { React.useEffect(() => { AccessibilityInfo.announceForAccessibility(message); }, [message]); return <View accessible accessibilityLabel={message}><Text style={styles.text}>{message}</Text></View>; } const styles = StyleSheet.create({ text: { fontSize: 16, color: '#374151' } });`, imports: ["import React from 'react';", "import { AccessibilityInfo, View, Text, StyleSheet } from 'react-native';"] };
}

// Skip Navigation
export function generateRNSkipNavigation(resolved: ResolvedComponent, variant: string = 'minimal') {
  return { code: `import React from 'react'; import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; export default function SkipNavigation({ onSkip }: { onSkip?: () => void }) { return <TouchableOpacity style={styles.button} onPress={onSkip} accessibilityRole="button" accessibilityLabel="Skip to main content"><Text style={styles.text}>Skip to content</Text></TouchableOpacity>; } const styles = StyleSheet.create({ button: { padding: 12, backgroundColor: '#3b82f6', borderRadius: 4 }, text: { color: '#fff', fontWeight: '600' } });`, imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"] };
}

// Accessibility Menu
export function generateRNAccessibilityMenu(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNFontSizeAdjuster(resolved, variant);
}

// Connection Lost Banner
export function generateRNConnectionLostBanner(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionLostBannerProps { onRetry?: () => void; }

export default function ConnectionLostBanner({ onRetry }: ConnectionLostBannerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={20} color="#fff" />
      <Text style={styles.message}>No internet connection</Text>
      {onRetry && <TouchableOpacity onPress={onRetry}><Text style={styles.retry}>Retry</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', paddingVertical: 10, gap: 10 },
  message: { color: '#fff', fontSize: 14 },
  retry: { color: '#fff', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Offline Mode Interface
export function generateRNOfflineModeInterface(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfflineModeInterfaceProps { onRetry?: () => void; }

export default function OfflineModeInterface({ onRetry }: OfflineModeInterfaceProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={80} color="#d1d5db" />
      <Text style={styles.title}>You're Offline</Text>
      <Text style={styles.message}>Please check your internet connection and try again.</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}><Ionicons name="refresh" size={20} color="#fff" /><Text style={styles.buttonText}>Try Again</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 8 },
  message: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Status Page Service
export function generateRNStatusPageService(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service { name: string; status: 'operational' | 'degraded' | 'outage'; }
interface StatusPageServiceProps { services: Service[]; lastUpdated?: string; }

export default function StatusPageService({ services, lastUpdated }: StatusPageServiceProps) {
  const config = { operational: { color: '#10b981', text: 'Operational', icon: 'checkmark-circle' }, degraded: { color: '#f59e0b', text: 'Degraded', icon: 'warning' }, outage: { color: '#ef4444', text: 'Outage', icon: 'alert-circle' } };
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: allOperational ? '#d1fae5' : '#fef3c7' }]}>
        <Ionicons name={allOperational ? 'checkmark-circle' : 'warning'} size={24} color={allOperational ? '#10b981' : '#f59e0b'} />
        <Text style={[styles.headerText, { color: allOperational ? '#065f46' : '#92400e' }]}>{allOperational ? 'All Systems Operational' : 'Some Systems Affected'}</Text>
      </View>
      {services.map((service, i) => { const c = config[service.status]; return (
        <View key={i} style={styles.service}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: c.color + '20' }]}>
            <Ionicons name={c.icon as any} size={14} color={c.color} />
            <Text style={[styles.statusText, { color: c.color }]}>{c.text}</Text>
          </View>
        </View>
      ); })}
      {lastUpdated && <Text style={styles.updated}>Last updated: {lastUpdated}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  headerText: { fontSize: 16, fontWeight: '600' },
  service: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  serviceName: { fontSize: 15, color: '#111827' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  updated: { fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 16 },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Success Message
export function generateRNSuccessMessage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessMessageProps { title?: string; message?: string; onDismiss?: () => void; action?: { label: string; onPress: () => void }; }

export default function SuccessMessage({ title = 'Success!', message = 'Your action was completed successfully.', onDismiss, action }: SuccessMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}><Ionicons name="checkmark" size={40} color="#fff" /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && <TouchableOpacity style={styles.button} onPress={action.onPress}><Text style={styles.buttonText}>{action.label}</Text></TouchableOpacity>}
      {onDismiss && <TouchableOpacity onPress={onDismiss}><Text style={styles.dismiss}>Dismiss</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  message: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8, marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dismiss: { color: '#6b7280', fontSize: 14 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// No Results Found
export function generateRNNoResultsFound(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNEmptyStateNoData(resolved, variant);
}

// Onboarding Flow
export function generateRNOnboardingFlow(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNInteractiveDemo(resolved, variant);
}

// Export Data Interface
export function generateRNExportDataInterface(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExportDataInterfaceProps { formats?: string[]; onExport?: (format: string) => void; }

export default function ExportDataInterface({ formats = ['CSV', 'PDF', 'Excel', 'JSON'], onExport }: ExportDataInterfaceProps) {
  const icons = { CSV: 'document-text', PDF: 'document', Excel: 'grid', JSON: 'code-slash' };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Data</Text>
      <Text style={styles.subtitle}>Choose a format to export your data</Text>
      <View style={styles.options}>
        {formats.map(format => (
          <TouchableOpacity key={format} style={styles.option} onPress={() => onExport?.(format)}>
            <Ionicons name={(icons as any)[format] || 'document'} size={24} color="#3b82f6" />
            <Text style={styles.optionText}>{format}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', borderRadius: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: { width: '47%', alignItems: 'center', padding: 20, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  optionText: { fontSize: 14, fontWeight: '500', color: '#374151', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Database Management
export function generateRNDatabaseManagement(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNStatusPageService(resolved, variant);
}

// Chatbot Support
export function generateRNChatbotSupport(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message { id: string; text: string; sender: 'user' | 'bot'; }
interface ChatbotSupportProps { messages?: Message[]; onSend?: (text: string) => void; botName?: string; }

export default function ChatbotSupport({ messages = [], onSend, botName = 'Assistant' }: ChatbotSupportProps) {
  const [text, setText] = useState('');
  const handleSend = () => { if (text.trim()) { onSend?.(text); setText(''); } };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}><View style={styles.botIcon}><Ionicons name="chatbubble-ellipses" size={20} color="#fff" /></View><View><Text style={styles.botName}>{botName}</Text><Text style={styles.status}>Online</Text></View></View>
      <FlatList data={messages} keyExtractor={item => item.id} renderItem={({ item }) => (<View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.botMessage]}><Text style={[styles.messageText, item.sender === 'user' && styles.userText]}>{item.text}</Text></View>)} contentContainerStyle={styles.messages} inverted />
      <View style={styles.inputContainer}><TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type a message..." /><TouchableOpacity style={styles.sendButton} onPress={handleSend}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity></View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 12 },
  botIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  botName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  status: { fontSize: 12, color: '#10b981' },
  messages: { padding: 16 },
  message: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageText: { fontSize: 14, color: '#111827' },
  userText: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', gap: 8 },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';"],
  };
}

// Payment Method (Widget version - alternate to ecommerce version)
export function generateRNPaymentMethodWidget(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethod { id: string; type: string; last4?: string; icon: string; }
interface PaymentMethodProps { methods: PaymentMethod[]; selected?: string; onSelect?: (id: string) => void; onAdd?: () => void; }

export default function PaymentMethod({ methods, selected, onSelect, onAdd }: PaymentMethodProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>
      {methods.map(method => (
        <TouchableOpacity key={method.id} style={[styles.method, selected === method.id && styles.methodSelected]} onPress={() => onSelect?.(method.id)}>
          <Ionicons name={method.icon as any} size={24} color="#374151" />
          <View style={styles.methodInfo}><Text style={styles.methodType}>{method.type}</Text>{method.last4 && <Text style={styles.methodLast4}>•••• {method.last4}</Text>}</View>
          {selected === method.id && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={onAdd}><Ionicons name="add" size={20} color="#3b82f6" /><Text style={styles.addText}>Add Payment Method</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  method: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  methodSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  methodInfo: { flex: 1, marginLeft: 12 },
  methodType: { fontSize: 15, fontWeight: '500', color: '#111827' },
  methodLast4: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderColor: '#3b82f6', borderRadius: 12, borderStyle: 'dashed', marginTop: 8, gap: 8 },
  addText: { fontSize: 14, fontWeight: '500', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// ===========================
// COUNTDOWN TIMER COMPONENTS
// ===========================

// Countdown Timer Event
export function generateRNCountdownTimerEvent(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CountdownTimerEventProps {
  targetDate: Date;
  eventName?: string;
  onComplete?: () => void;
}

export default function CountdownTimerEvent({ targetDate, eventName = 'Event', onComplete }: CountdownTimerEventProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.unit}>
      <View style={styles.valueBox}>
        <Text style={styles.value}>{value.toString().padStart(2, '0')}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.eventName}>{eventName}</Text>
      <View style={styles.timerRow}>
        <TimeUnit value={timeLeft.days} label="Days" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <Text style={styles.separator}>:</Text>
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 16 },
  eventName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 20 },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  unit: { alignItems: 'center' },
  valueBox: { backgroundColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  value: { fontSize: 28, fontWeight: '700', color: '#fff' },
  label: { fontSize: 12, color: '#6b7280', marginTop: 8, textTransform: 'uppercase' },
  separator: { fontSize: 28, fontWeight: '700', color: '#d1d5db', marginHorizontal: 4 },
});`,
    imports: ["import React, { useState, useEffect } from 'react';", "import { View, Text, StyleSheet } from 'react-native';"],
  };
}

// Countdown Timer Offer
export function generateRNCountdownTimerOffer(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CountdownTimerOfferProps {
  endDate: Date;
  title?: string;
  discount?: string;
  description?: string;
  onShopNow?: () => void;
  onComplete?: () => void;
}

export default function CountdownTimerOffer({ endDate, title = 'Flash Sale', discount = '50% OFF', description = 'Limited time offer!', onShopNow, onComplete }: CountdownTimerOfferProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(endDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name="flash" size={16} color="#fff" />
        <Text style={styles.badgeText}>{title}</Text>
      </View>
      <Text style={styles.discount}>{discount}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.timerRow}>
        <View style={styles.timeBox}><Text style={styles.timeValue}>{timeLeft.hours.toString().padStart(2, '0')}</Text><Text style={styles.timeLabel}>HRS</Text></View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.timeBox}><Text style={styles.timeValue}>{timeLeft.minutes.toString().padStart(2, '0')}</Text><Text style={styles.timeLabel}>MIN</Text></View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.timeBox}><Text style={styles.timeValue}>{timeLeft.seconds.toString().padStart(2, '0')}</Text><Text style={styles.timeLabel}>SEC</Text></View>
      </View>
      <TouchableOpacity style={styles.shopButton} onPress={onShopNow}>
        <Text style={styles.shopButtonText}>Shop Now</Text>
        <Ionicons name="arrow-forward" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ef4444', padding: 24, borderRadius: 16, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, marginBottom: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  discount: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 20 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timeBox: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: 'center', minWidth: 56 },
  timeValue: { fontSize: 24, fontWeight: '700', color: '#fff' },
  timeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  colon: { fontSize: 24, fontWeight: '700', color: '#fff', marginHorizontal: 6 },
  shopButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, gap: 8 },
  shopButtonText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});`,
    imports: ["import React, { useState, useEffect } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// ===========================
// EVENT COMPONENTS
// ===========================

// Event Grid
export function generateRNEventGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Event { id: string; title: string; image: string; date: string; time: string; location: string; price?: number; category?: string; }
interface EventGridProps { events: Event[]; onEventPress?: (event: Event) => void; }

export default function EventGrid({ events, onEventPress }: EventGridProps) {
  const cardWidth = (Dimensions.get('window').width - 48) / 2;

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={[styles.eventCard, { width: cardWidth }]} onPress={() => onEventPress?.(item)}>
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      {item.category && <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View>}
      <View style={styles.eventInfo}>
        <Text style={styles.eventDate}>{item.date} • {item.time}</Text>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.locationRow}><Ionicons name="location-outline" size={12} color="#6b7280" /><Text style={styles.locationText} numberOfLines={1}>{item.location}</Text></View>
        {item.price !== undefined && <Text style={styles.price}>{item.price === 0 ? 'Free' : \`$\${item.price}\`}</Text>}
      </View>
    </TouchableOpacity>
  );

  return <FlatList data={events} renderItem={renderEvent} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  eventCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  eventImage: { width: '100%', height: 100, backgroundColor: '#f3f4f6' },
  categoryBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  eventInfo: { padding: 12 },
  eventDate: { fontSize: 11, color: '#3b82f6', fontWeight: '600', marginBottom: 4 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6, lineHeight: 18 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: '#6b7280', flex: 1 },
  price: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';"],
  };
}

// Event Card
export function generateRNEventCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps { title: string; image: string; date: string; time: string; location: string; price?: number; attendees?: number; onPress?: () => void; onSave?: () => void; isSaved?: boolean; }

export default function EventCard({ title, image, date, time, location, price, attendees, onPress, onSave, isSaved = false }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: image }} style={styles.image} />
      <TouchableOpacity style={styles.saveButton} onPress={onSave}><Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#ef4444' : '#fff'} /></TouchableOpacity>
      <View style={styles.dateTag}><Text style={styles.dateDay}>{date.split(' ')[0]}</Text><Text style={styles.dateMonth}>{date.split(' ')[1]}</Text></View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.infoRow}><Ionicons name="time-outline" size={14} color="#6b7280" /><Text style={styles.infoText}>{time}</Text></View>
        <View style={styles.infoRow}><Ionicons name="location-outline" size={14} color="#6b7280" /><Text style={styles.infoText} numberOfLines={1}>{location}</Text></View>
        <View style={styles.footer}>
          {price !== undefined && <Text style={styles.price}>{price === 0 ? 'Free' : \`$\${price}\`}</Text>}
          {attendees !== undefined && <View style={styles.attendeesRow}><Ionicons name="people-outline" size={14} color="#6b7280" /><Text style={styles.attendeesText}>{attendees} going</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  image: { width: '100%', height: 160, backgroundColor: '#f3f4f6' },
  saveButton: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  dateTag: { position: 'absolute', top: 12, left: 12, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  dateDay: { fontSize: 18, fontWeight: '700', color: '#111827' },
  dateMonth: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12, lineHeight: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 14, color: '#6b7280', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  price: { fontSize: 18, fontWeight: '700', color: '#3b82f6' },
  attendeesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendeesText: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Event Detail Page
export function generateRNEventDetailPage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventDetailPageProps {
  event: { id: string; title: string; image: string; date: string; time: string; endTime?: string; location: string; address?: string; description: string; organizer: string; organizerImage?: string; price?: number; attendees?: number; };
  onGetTickets?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

export default function EventDetailPage({ event, onGetTickets, onShare, onBack }: EventDetailPageProps) {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: event.image }} style={styles.headerImage} />
        <TouchableOpacity style={styles.backButton} onPress={onBack}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}><Ionicons name="share-outline" size={24} color="#fff" /></TouchableOpacity>
        <View style={styles.content}>
          <View style={styles.dateCard}><Text style={styles.dateDay}>{event.date.split(' ')[0]}</Text><Text style={styles.dateMonth}>{event.date.split(' ')[1]}</Text></View>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}><View style={styles.infoIcon}><Ionicons name="calendar-outline" size={20} color="#3b82f6" /></View><View><Text style={styles.infoLabel}>Date & Time</Text><Text style={styles.infoValue}>{event.date}</Text><Text style={styles.infoSubvalue}>{event.time}{event.endTime ? \` - \${event.endTime}\` : ''}</Text></View></View>
            <View style={styles.infoItem}><View style={styles.infoIcon}><Ionicons name="location-outline" size={20} color="#3b82f6" /></View><View style={{ flex: 1 }}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{event.location}</Text>{event.address && <Text style={styles.infoSubvalue}>{event.address}</Text>}</View></View>
            <View style={styles.infoItem}><View style={styles.infoIcon}><Ionicons name="person-outline" size={20} color="#3b82f6" /></View><View style={{ flex: 1 }}><Text style={styles.infoLabel}>Organized by</Text><Text style={styles.infoValue}>{event.organizer}</Text></View></View>
          </View>
          <View style={styles.aboutSection}><Text style={styles.sectionTitle}>About Event</Text><Text style={styles.description}>{event.description}</Text></View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.priceContainer}><Text style={styles.priceLabel}>Price</Text><Text style={styles.price}>{event.price === 0 ? 'Free' : \`$\${event.price}\`}</Text></View>
        <TouchableOpacity style={styles.getTicketsButton} onPress={onGetTickets}><Text style={styles.getTicketsText}>Get Tickets</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerImage: { width: '100%', height: 280, backgroundColor: '#f3f4f6' },
  backButton: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  shareButton: { position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, marginTop: -40, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  dateCard: { position: 'absolute', top: -60, right: 20, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  dateDay: { fontSize: 24, fontWeight: '700', color: '#111827' },
  dateMonth: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20, marginTop: 8, paddingRight: 80 },
  infoSection: { gap: 16, marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  infoSubvalue: { fontSize: 13, color: '#6b7280' },
  aboutSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 24, fontWeight: '700', color: '#111827' },
  getTicketsButton: { backgroundColor: '#3b82f6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  getTicketsText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Ticket Selector
export function generateRNTicketSelector(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TicketType { id: string; name: string; description?: string; price: number; available: number; maxPerOrder?: number; }
interface TicketSelectorProps { tickets: TicketType[]; onSelectionChange?: (selection: Record<string, number>) => void; currency?: string; }

export default function TicketSelector({ tickets, onSelectionChange, currency = '$' }: TicketSelectorProps) {
  const [selection, setSelection] = useState<Record<string, number>>({});

  const updateQuantity = (ticketId: string, delta: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const current = selection[ticketId] || 0;
    const max = Math.min(ticket.available, ticket.maxPerOrder || 10);
    const newQty = Math.max(0, Math.min(max, current + delta));
    const newSelection = { ...selection, [ticketId]: newQty };
    if (newQty === 0) delete newSelection[ticketId];
    setSelection(newSelection);
    onSelectionChange?.(newSelection);
  };

  const total = tickets.reduce((sum, t) => sum + (selection[t.id] || 0) * t.price, 0);

  return (
    <ScrollView style={styles.container}>
      {tickets.map((ticket) => (
        <View key={ticket.id} style={styles.ticketItem}>
          <View style={styles.ticketInfo}><Text style={styles.ticketName}>{ticket.name}</Text>{ticket.description && <Text style={styles.ticketDescription}>{ticket.description}</Text>}<Text style={styles.ticketPrice}>{currency}{ticket.price.toFixed(2)}</Text><Text style={styles.availability}>{ticket.available} available</Text></View>
          <View style={styles.quantityControl}>
            <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(ticket.id, -1)} disabled={(selection[ticket.id] || 0) === 0}><Ionicons name="remove" size={20} color={(selection[ticket.id] || 0) === 0 ? '#d1d5db' : '#374151'} /></TouchableOpacity>
            <Text style={styles.quantity}>{selection[ticket.id] || 0}</Text>
            <TouchableOpacity style={styles.quantityBtn} onPress={() => updateQuantity(ticket.id, 1)} disabled={ticket.available === 0}><Ionicons name="add" size={20} color={ticket.available === 0 ? '#d1d5db' : '#374151'} /></TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={styles.totalSection}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalAmount}>{currency}{total.toFixed(2)}</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  ticketInfo: { flex: 1, marginRight: 16 },
  ticketName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  ticketDescription: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  ticketPrice: { fontSize: 18, fontWeight: '700', color: '#3b82f6' },
  availability: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 8, padding: 4 },
  quantityBtn: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: 16, fontWeight: '600', color: '#111827', minWidth: 36, textAlign: 'center' },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#111827' },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#111827' },
  totalAmount: { fontSize: 24, fontWeight: '700', color: '#111827' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Ticket List
export function generateRNTicketList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ticket { id: string; eventName: string; date: string; time: string; location: string; ticketType: string; seatNumber?: string; status: 'upcoming' | 'used' | 'expired'; }
interface TicketListProps { tickets: Ticket[]; onTicketPress?: (ticket: Ticket) => void; }

export default function TicketList({ tickets, onTicketPress }: TicketListProps) {
  const getStatusStyle = (status: Ticket['status']) => {
    switch (status) { case 'upcoming': return { bg: '#dcfce7', text: '#16a34a' }; case 'used': return { bg: '#f3f4f6', text: '#6b7280' }; case 'expired': return { bg: '#fee2e2', text: '#dc2626' }; }
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity style={styles.ticketCard} onPress={() => onTicketPress?.(item)}>
        <View style={styles.ticketLeft}><View style={styles.dateBox}><Text style={styles.dateDay}>{item.date.split(' ')[0]}</Text><Text style={styles.dateMonth}>{item.date.split(' ')[1]}</Text></View></View>
        <View style={styles.divider}><View style={styles.notchTop} /><View style={styles.dottedLine} /><View style={styles.notchBottom} /></View>
        <View style={styles.ticketRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}><Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text></View>
          <Text style={styles.eventName} numberOfLines={1}>{item.eventName}</Text>
          <View style={styles.detailRow}><Ionicons name="time-outline" size={12} color="#6b7280" /><Text style={styles.detailText}>{item.time}</Text></View>
          <View style={styles.detailRow}><Ionicons name="location-outline" size={12} color="#6b7280" /><Text style={styles.detailText} numberOfLines={1}>{item.location}</Text></View>
          <View style={styles.ticketInfo}><Text style={styles.ticketType}>{item.ticketType}</Text>{item.seatNumber && <Text style={styles.seatNumber}>Seat: {item.seatNumber}</Text>}</View>
        </View>
      </TouchableOpacity>
    );
  };

  return <FlatList data={tickets} renderItem={renderTicket} keyExtractor={(item) => item.id} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  ticketCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  ticketLeft: { width: 80, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', padding: 12 },
  dateBox: { alignItems: 'center' },
  dateDay: { fontSize: 28, fontWeight: '700', color: '#fff' },
  dateMonth: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  divider: { width: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between' },
  notchTop: { width: 20, height: 10, backgroundColor: '#f9fafb', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  notchBottom: { width: 20, height: 10, backgroundColor: '#f9fafb', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  dottedLine: { flex: 1, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: '#e5e7eb' },
  ticketRight: { flex: 1, padding: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  eventName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  detailText: { fontSize: 12, color: '#6b7280', flex: 1 },
  ticketInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  ticketType: { fontSize: 12, fontWeight: '500', color: '#3b82f6' },
  seatNumber: { fontSize: 12, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Ticket Detail View
export function generateRNTicketDetailView(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TicketDetailViewProps {
  ticket: { id: string; eventName: string; date: string; time: string; location: string; address?: string; ticketType: string; ticketNumber: string; seatNumber?: string; section?: string; purchaseDate: string; buyerName: string; price: number; status: 'upcoming' | 'used' | 'expired'; };
  onDownload?: () => void;
  onShare?: () => void;
  onAddToWallet?: () => void;
}

export default function TicketDetailView({ ticket, onDownload, onShare, onAddToWallet }: TicketDetailViewProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.qrSection}><View style={styles.qrPlaceholder}><Ionicons name="qr-code" size={120} color="#111827" /></View><Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text></View>
      <View style={styles.ticketCard}>
        <Text style={styles.eventName}>{ticket.eventName}</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}><Ionicons name="calendar-outline" size={20} color="#6b7280" /><View><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{ticket.date}</Text></View></View>
          <View style={styles.detailItem}><Ionicons name="time-outline" size={20} color="#6b7280" /><View><Text style={styles.detailLabel}>Time</Text><Text style={styles.detailValue}>{ticket.time}</Text></View></View>
          <View style={styles.detailItem}><Ionicons name="location-outline" size={20} color="#6b7280" /><View style={{ flex: 1 }}><Text style={styles.detailLabel}>Venue</Text><Text style={styles.detailValue}>{ticket.location}</Text></View></View>
          {ticket.seatNumber && <View style={styles.detailItem}><Ionicons name="grid-outline" size={20} color="#6b7280" /><View><Text style={styles.detailLabel}>Seat</Text><Text style={styles.detailValue}>{ticket.section ? \`\${ticket.section} / \` : ''}{ticket.seatNumber}</Text></View></View>}
        </View>
        <View style={styles.divider} />
        <View style={styles.purchaseInfo}>
          <View style={styles.purchaseRow}><Text style={styles.purchaseLabel}>Ticket Type</Text><Text style={styles.purchaseValue}>{ticket.ticketType}</Text></View>
          <View style={styles.purchaseRow}><Text style={styles.purchaseLabel}>Buyer</Text><Text style={styles.purchaseValue}>{ticket.buyerName}</Text></View>
          <View style={styles.purchaseRow}><Text style={styles.purchaseLabel}>Purchase Date</Text><Text style={styles.purchaseValue}>{ticket.purchaseDate}</Text></View>
          <View style={styles.purchaseRow}><Text style={styles.purchaseLabel}>Price</Text><Text style={styles.priceValue}>\${ticket.price.toFixed(2)}</Text></View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onAddToWallet}><Ionicons name="wallet-outline" size={20} color="#3b82f6" /><Text style={styles.actionText}>Add to Wallet</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDownload}><Ionicons name="download-outline" size={20} color="#3b82f6" /><Text style={styles.actionText}>Download</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}><Ionicons name="share-outline" size={20} color="#3b82f6" /><Text style={styles.actionText}>Share</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  qrSection: { alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  qrPlaceholder: { width: 180, height: 180, backgroundColor: '#f3f4f6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ticketNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  ticketCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16 },
  eventName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  detailsGrid: { gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '500', color: '#111827' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  purchaseInfo: { gap: 12 },
  purchaseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  purchaseLabel: { fontSize: 14, color: '#6b7280' },
  purchaseValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 16 },
  actionButton: { alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, flex: 1 },
  actionText: { fontSize: 12, fontWeight: '500', color: '#3b82f6', marginTop: 8 },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Ticket Card
export function generateRNTicketCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TicketCardProps { eventName: string; date: string; time: string; ticketType: string; quantity: number; price: number; onPress?: () => void; }

export default function TicketCard({ eventName, date, time, ticketType, quantity, price, onPress }: TicketCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.leftSection}><View style={styles.dateBox}><Text style={styles.dateDay}>{date.split(' ')[0]}</Text><Text style={styles.dateMonth}>{date.split(' ')[1]}</Text></View></View>
      <View style={styles.mainSection}>
        <Text style={styles.eventName} numberOfLines={1}>{eventName}</Text>
        <View style={styles.infoRow}><Ionicons name="time-outline" size={14} color="#6b7280" /><Text style={styles.infoText}>{time}</Text></View>
        <View style={styles.ticketInfo}><Text style={styles.ticketType}>{ticketType}</Text><Text style={styles.quantity}>x{quantity}</Text></View>
      </View>
      <View style={styles.rightSection}><Text style={styles.price}>\${price.toFixed(2)}</Text><Ionicons name="chevron-forward" size={20} color="#9ca3af" /></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  leftSection: { marginRight: 12 },
  dateBox: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 8, alignItems: 'center', minWidth: 50 },
  dateDay: { fontSize: 18, fontWeight: '700', color: '#3b82f6' },
  dateMonth: { fontSize: 10, color: '#3b82f6', textTransform: 'uppercase' },
  mainSection: { flex: 1 },
  eventName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  infoText: { fontSize: 12, color: '#6b7280' },
  ticketInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketType: { fontSize: 12, fontWeight: '500', color: '#3b82f6', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  quantity: { fontSize: 12, color: '#6b7280' },
  rightSection: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Property Card
export function generateRNPropertyCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PropertyCardProps { image: string; title: string; address: string; price: number; priceType?: 'sale' | 'rent'; bedrooms?: number; bathrooms?: number; area?: number; areaUnit?: string; featured?: boolean; onPress?: () => void; onSave?: () => void; isSaved?: boolean; }

export default function PropertyCard({ image, title, address, price, priceType = 'sale', bedrooms, bathrooms, area, areaUnit = 'sqft', featured, onPress, onSave, isSaved = false }: PropertyCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {featured && <View style={styles.featuredBadge}><Text style={styles.featuredText}>Featured</Text></View>}
        <TouchableOpacity style={styles.saveButton} onPress={onSave}><Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#ef4444' : '#fff'} /></TouchableOpacity>
        <View style={styles.priceBadge}><Text style={styles.price}>\${price.toLocaleString()}</Text>{priceType === 'rent' && <Text style={styles.priceType}>/month</Text>}</View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.addressRow}><Ionicons name="location-outline" size={14} color="#6b7280" /><Text style={styles.address} numberOfLines={1}>{address}</Text></View>
        <View style={styles.features}>
          {bedrooms !== undefined && <View style={styles.feature}><Ionicons name="bed-outline" size={16} color="#6b7280" /><Text style={styles.featureText}>{bedrooms}</Text></View>}
          {bathrooms !== undefined && <View style={styles.feature}><Ionicons name="water-outline" size={16} color="#6b7280" /><Text style={styles.featureText}>{bathrooms}</Text></View>}
          {area !== undefined && <View style={styles.feature}><Ionicons name="resize-outline" size={16} color="#6b7280" /><Text style={styles.featureText}>{area} {areaUnit}</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 180, backgroundColor: '#f3f4f6' },
  featuredBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  featuredText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  saveButton: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  priceBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'baseline' },
  price: { color: '#fff', fontSize: 16, fontWeight: '700' },
  priceType: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginLeft: 2 },
  content: { padding: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  address: { fontSize: 13, color: '#6b7280', flex: 1 },
  features: { flexDirection: 'row', gap: 16 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureText: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Property Search
export function generateRNPropertySearch(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PropertySearchProps { onSearch?: (filters: any) => void; }

export default function PropertySearch({ onSearch }: PropertySearchProps) {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [listingType, setListingType] = useState<'buy' | 'rent'>('buy');
  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Land'];

  const handleSearch = () => { onSearch?.({ location, propertyType, listingType }); };

  return (
    <View style={styles.container}>
      <View style={styles.listingToggle}>
        <TouchableOpacity style={[styles.toggleBtn, listingType === 'buy' && styles.toggleBtnActive]} onPress={() => setListingType('buy')}><Text style={[styles.toggleText, listingType === 'buy' && styles.toggleTextActive]}>Buy</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, listingType === 'rent' && styles.toggleBtnActive]} onPress={() => setListingType('rent')}><Text style={[styles.toggleText, listingType === 'rent' && styles.toggleTextActive]}>Rent</Text></TouchableOpacity>
      </View>
      <View style={styles.searchBar}><Ionicons name="search" size={20} color="#6b7280" /><TextInput style={styles.searchInput} placeholder="City, neighborhood, or address" value={location} onChangeText={setLocation} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
        {propertyTypes.map((type) => (
          <TouchableOpacity key={type} style={[styles.filterChip, propertyType === type && styles.filterChipActive]} onPress={() => setPropertyType(propertyType === type ? null : type)}><Text style={[styles.filterChipText, propertyType === type && styles.filterChipTextActive]}>{type}</Text></TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}><Ionicons name="search" size={20} color="#fff" /><Text style={styles.searchButtonText}>Search Properties</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  listingToggle: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  toggleTextActive: { color: '#111827' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, marginLeft: 8 },
  quickFilters: { marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterChipActive: { backgroundColor: '#3b82f6' },
  filterChipText: { fontSize: 13, color: '#374151' },
  filterChipTextActive: { color: '#fff' },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, gap: 8 },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Vehicle Card
export function generateRNVehicleCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VehicleCardProps { image: string; make: string; model: string; year: number; price: number; mileage?: number; fuelType?: string; transmission?: string; onPress?: () => void; onSave?: () => void; isSaved?: boolean; }

export default function VehicleCard({ image, make, model, year, price, mileage, fuelType, transmission, onPress, onSave, isSaved = false }: VehicleCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: image }} style={styles.image} />
      <TouchableOpacity style={styles.saveButton} onPress={onSave}><Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#ef4444' : '#fff'} /></TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.header}><Text style={styles.title}>{year} {make} {model}</Text><Text style={styles.price}>\${price.toLocaleString()}</Text></View>
        <View style={styles.specs}>
          {mileage && <View style={styles.spec}><Ionicons name="speedometer-outline" size={14} color="#6b7280" /><Text style={styles.specText}>{mileage.toLocaleString()} mi</Text></View>}
          {fuelType && <View style={styles.spec}><Ionicons name="flash-outline" size={14} color="#6b7280" /><Text style={styles.specText}>{fuelType}</Text></View>}
          {transmission && <View style={styles.spec}><Ionicons name="settings-outline" size={14} color="#6b7280" /><Text style={styles.specText}>{transmission}</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  image: { width: '100%', height: 180, backgroundColor: '#f3f4f6' },
  saveButton: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  price: { fontSize: 18, fontWeight: '700', color: '#3b82f6' },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { fontSize: 13, color: '#6b7280' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Service Booking
export function generateRNServiceBooking(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service { id: string; name: string; duration: string; price: number; }
interface ServiceBookingProps { services: Service[]; onBook?: (data: any) => void; }

export default function ServiceBooking({ services, onBook }: ServiceBookingProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const handleBook = () => {
    const service = services.find(s => s.id === selectedService);
    onBook?.({ service, date: selectedDate, time: selectedTime, notes });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Select Service</Text>
      {services.map((service) => (
        <TouchableOpacity key={service.id} style={[styles.serviceItem, selectedService === service.id && styles.serviceItemActive]} onPress={() => setSelectedService(service.id)}>
          <View style={styles.serviceInfo}><Text style={styles.serviceName}>{service.name}</Text><Text style={styles.serviceDuration}>{service.duration}</Text></View>
          <Text style={styles.servicePrice}>\${service.price}</Text>
          {selectedService === service.id && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Select Date</Text>
      <TextInput style={styles.dateInput} placeholder="Select a date" value={selectedDate} onChangeText={setSelectedDate} />

      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeGrid}>
        {times.map((time) => (
          <TouchableOpacity key={time} style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]} onPress={() => setSelectedTime(time)}>
            <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Additional Notes</Text>
      <TextInput style={styles.notesInput} placeholder="Any special requests?" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <TouchableOpacity style={[styles.bookButton, (!selectedService || !selectedDate || !selectedTime) && styles.bookButtonDisabled]} onPress={handleBook} disabled={!selectedService || !selectedDate || !selectedTime}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12, marginTop: 16 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  serviceItemActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  serviceDuration: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  servicePrice: { fontSize: 16, fontWeight: '700', color: '#3b82f6', marginRight: 12 },
  dateInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, fontSize: 16 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  timeSlotActive: { backgroundColor: '#3b82f6' },
  timeText: { fontSize: 14, color: '#374151' },
  timeTextActive: { color: '#fff', fontWeight: '500' },
  notesInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  bookButton: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  bookButtonDisabled: { backgroundColor: '#d1d5db' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';"],
  };
}

// Time Slot Picker
export function generateRNTimeSlotPicker(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeSlot { time: string; available: boolean; }
interface TimeSlotPickerProps { date: string; slots: TimeSlot[]; onSelect?: (time: string) => void; selectedTime?: string; }

export default function TimeSlotPicker({ date, slots, onSelect, selectedTime }: TimeSlotPickerProps) {
  const morningSlots = slots.filter(s => parseInt(s.time) < 12);
  const afternoonSlots = slots.filter(s => parseInt(s.time) >= 12 && parseInt(s.time) < 17);
  const eveningSlots = slots.filter(s => parseInt(s.time) >= 17);

  const renderSlots = (title: string, slotList: TimeSlot[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.slotsGrid}>
        {slotList.map((slot) => (
          <TouchableOpacity key={slot.time} style={[styles.slot, !slot.available && styles.slotUnavailable, selectedTime === slot.time && styles.slotSelected]} onPress={() => slot.available && onSelect?.(slot.time)} disabled={!slot.available}>
            <Text style={[styles.slotText, !slot.available && styles.slotTextUnavailable, selectedTime === slot.time && styles.slotTextSelected]}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Ionicons name="calendar-outline" size={20} color="#3b82f6" /><Text style={styles.date}>{date}</Text></View>
      {morningSlots.length > 0 && renderSlots('Morning', morningSlots)}
      {afternoonSlots.length > 0 && renderSlots('Afternoon', afternoonSlots)}
      {eveningSlots.length > 0 && renderSlots('Evening', eveningSlots)}
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' }]} /><Text style={styles.legendText}>Available</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Selected</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f3f4f6' }]} /><Text style={styles.legendText}>Unavailable</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  date: { fontSize: 18, fontWeight: '600', color: '#111827' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', minWidth: 80, alignItems: 'center' },
  slotUnavailable: { backgroundColor: '#f3f4f6', borderColor: '#f3f4f6' },
  slotSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  slotText: { fontSize: 14, color: '#111827' },
  slotTextUnavailable: { color: '#9ca3af' },
  slotTextSelected: { color: '#fff', fontWeight: '500' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#6b7280' },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Booking Summary
export function generateRNBookingSummary(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingSummaryProps {
  serviceName: string;
  providerName?: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  price: number;
  fees?: number;
  onConfirm?: () => void;
  onEdit?: () => void;
}

export default function BookingSummary({ serviceName, providerName, date, time, duration, location, price, fees = 0, onConfirm, onEdit }: BookingSummaryProps) {
  const total = price + fees;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Booking Summary</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editText}>Edit</Text></TouchableOpacity></View>

      <View style={styles.card}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        {providerName && <Text style={styles.providerName}>with {providerName}</Text>}

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}><Ionicons name="calendar-outline" size={18} color="#6b7280" /><View><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{date}</Text></View></View>
          <View style={styles.detailRow}><Ionicons name="time-outline" size={18} color="#6b7280" /><View><Text style={styles.detailLabel}>Time</Text><Text style={styles.detailValue}>{time}{duration ? \` (\${duration})\` : ''}</Text></View></View>
          {location && <View style={styles.detailRow}><Ionicons name="location-outline" size={18} color="#6b7280" /><View style={{ flex: 1 }}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{location}</Text></View></View>}
        </View>
      </View>

      <View style={styles.priceCard}>
        <View style={styles.priceRow}><Text style={styles.priceLabel}>Service</Text><Text style={styles.priceValue}>\${price.toFixed(2)}</Text></View>
        {fees > 0 && <View style={styles.priceRow}><Text style={styles.priceLabel}>Service Fee</Text><Text style={styles.priceValue}>\${fees.toFixed(2)}</Text></View>}
        <View style={[styles.priceRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>\${total.toFixed(2)}</Text></View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}><Text style={styles.confirmButtonText}>Confirm Booking</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  editText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  serviceName: { fontSize: 18, fontWeight: '600', color: '#111827' },
  providerName: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  detailsSection: { gap: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailLabel: { fontSize: 12, color: '#6b7280' },
  detailValue: { fontSize: 15, fontWeight: '500', color: '#111827', marginTop: 2 },
  priceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#111827' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 8, paddingTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  confirmButton: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Pet Profile Card
export function generateRNPetProfileCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PetProfileCardProps { image?: string; name: string; species: string; breed?: string; age?: string; weight?: string; gender?: 'male' | 'female'; onPress?: () => void; onEdit?: () => void; }

export default function PetProfileCard({ image, name, species, breed, age, weight, gender, onPress, onEdit }: PetProfileCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        {image ? <Image source={{ uri: image }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Ionicons name="paw" size={32} color="#9ca3af" /></View>}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.species}>{species}{breed ? \` • \${breed}\` : ''}</Text>
        </View>
        {gender && <View style={[styles.genderBadge, gender === 'male' ? styles.maleBadge : styles.femaleBadge]}><Ionicons name={gender === 'male' ? 'male' : 'female'} size={16} color={gender === 'male' ? '#3b82f6' : '#ec4899'} /></View>}
      </View>
      <View style={styles.stats}>
        {age && <View style={styles.stat}><Ionicons name="calendar-outline" size={16} color="#6b7280" /><Text style={styles.statValue}>{age}</Text></View>}
        {weight && <View style={styles.stat}><Ionicons name="fitness-outline" size={16} color="#6b7280" /><Text style={styles.statValue}>{weight}</Text></View>}
      </View>
      {onEdit && <TouchableOpacity style={styles.editButton} onPress={onEdit}><Ionicons name="create-outline" size={18} color="#3b82f6" /><Text style={styles.editText}>Edit Profile</Text></TouchableOpacity>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 16 },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  species: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  genderBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  maleBadge: { backgroundColor: '#dbeafe' },
  femaleBadge: { backgroundColor: '#fce7f3' },
  stats: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 14, color: '#374151' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 6 },
  editText: { fontSize: 14, fontWeight: '500', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Pet Service Card
export function generateRNPetServiceCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PetServiceCardProps { image?: string; name: string; category: string; rating?: number; reviewCount?: number; price: number; priceUnit?: string; location?: string; onPress?: () => void; onBook?: () => void; }

export default function PetServiceCard({ image, name, category, rating, reviewCount, price, priceUnit = '/visit', location, onPress, onBook }: PetServiceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Ionicons name="paw" size={40} color="#d1d5db" /></View>}
      <View style={styles.content}>
        <View style={styles.categoryBadge}><Text style={styles.categoryText}>{category}</Text></View>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {rating !== undefined && (
          <View style={styles.ratingRow}><Ionicons name="star" size={14} color="#f59e0b" /><Text style={styles.rating}>{rating.toFixed(1)}</Text>{reviewCount !== undefined && <Text style={styles.reviewCount}>({reviewCount})</Text>}</View>
        )}
        {location && <View style={styles.locationRow}><Ionicons name="location-outline" size={14} color="#6b7280" /><Text style={styles.location} numberOfLines={1}>{location}</Text></View>}
        <View style={styles.footer}>
          <View><Text style={styles.price}>\${price}</Text><Text style={styles.priceUnit}>{priceUnit}</Text></View>
          <TouchableOpacity style={styles.bookButton} onPress={onBook}><Text style={styles.bookButtonText}>Book</Text></TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: '100%', height: 140, backgroundColor: '#f3f4f6' },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  name: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewCount: { fontSize: 12, color: '#9ca3af' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  location: { fontSize: 13, color: '#6b7280', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  price: { fontSize: 20, fontWeight: '700', color: '#111827' },
  priceUnit: { fontSize: 12, color: '#6b7280' },
  bookButton: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bookButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Trainer Grid
export function generateRNTrainerGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Trainer { id: string; name: string; image?: string; specialty: string; rating?: number; experience?: string; price?: number; }
interface TrainerGridProps { trainers: Trainer[]; onTrainerPress?: (trainer: Trainer) => void; }

export default function TrainerGrid({ trainers, onTrainerPress }: TrainerGridProps) {
  const cardWidth = (Dimensions.get('window').width - 48) / 2;

  const renderTrainer = ({ item }: { item: Trainer }) => (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={() => onTrainerPress?.(item)}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Ionicons name="person" size={40} color="#d1d5db" /></View>}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        {item.rating && <View style={styles.ratingRow}><Ionicons name="star" size={12} color="#f59e0b" /><Text style={styles.rating}>{item.rating.toFixed(1)}</Text></View>}
        {item.experience && <Text style={styles.experience}>{item.experience} exp</Text>}
        {item.price && <Text style={styles.price}>\${item.price}/session</Text>}
      </View>
    </TouchableOpacity>
  );

  return <FlatList data={trainers} renderItem={renderTrainer} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.container} />;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: '100%', height: 120, backgroundColor: '#f3f4f6' },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  specialty: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rating: { fontSize: 12, fontWeight: '600', color: '#111827' },
  experience: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';"],
  };
}

// Class Schedule Grid
export function generateRNClassScheduleGrid(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClassSession { id: string; name: string; instructor: string; time: string; duration: string; spotsLeft?: number; level?: string; }
interface DaySchedule { date: string; dayName: string; classes: ClassSession[]; }
interface ClassScheduleGridProps { schedule: DaySchedule[]; onClassPress?: (classSession: ClassSession) => void; }

export default function ClassScheduleGrid({ schedule, onClassPress }: ClassScheduleGridProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {schedule.map((day) => (
        <View key={day.date} style={styles.dayColumn}>
          <View style={styles.dayHeader}><Text style={styles.dayName}>{day.dayName}</Text><Text style={styles.dayDate}>{day.date}</Text></View>
          <ScrollView style={styles.classList}>
            {day.classes.map((cls) => (
              <TouchableOpacity key={cls.id} style={styles.classCard} onPress={() => onClassPress?.(cls)}>
                <Text style={styles.classTime}>{cls.time}</Text>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.instructor}>{cls.instructor}</Text>
                <View style={styles.classFooter}>
                  <Text style={styles.duration}>{cls.duration}</Text>
                  {cls.spotsLeft !== undefined && <View style={[styles.spotsBadge, cls.spotsLeft <= 3 && styles.spotsLow]}><Text style={[styles.spotsText, cls.spotsLeft <= 3 && styles.spotsTextLow]}>{cls.spotsLeft} spots</Text></View>}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  dayColumn: { width: 200 },
  dayHeader: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  dayName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dayDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  classList: { maxHeight: 400 },
  classCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#3b82f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  classTime: { fontSize: 12, fontWeight: '600', color: '#3b82f6', marginBottom: 4 },
  className: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  instructor: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  classFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duration: { fontSize: 11, color: '#9ca3af' },
  spotsBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  spotsLow: { backgroundColor: '#fee2e2' },
  spotsText: { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  spotsTextLow: { color: '#dc2626' },
});`,
    imports: ["import React from 'react';", "import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Course Modules List
export function generateRNCourseModulesList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Lesson { id: string; title: string; duration: string; type: 'video' | 'quiz' | 'reading'; completed?: boolean; locked?: boolean; }
interface Module { id: string; title: string; lessons: Lesson[]; duration: string; }
interface CourseModulesListProps { modules: Module[]; onLessonPress?: (lesson: Lesson) => void; }

export default function CourseModulesList({ modules, onLessonPress }: CourseModulesListProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]);
  };

  const getLessonIcon = (type: string) => {
    switch (type) { case 'video': return 'play-circle'; case 'quiz': return 'help-circle'; case 'reading': return 'document-text'; default: return 'ellipse'; }
  };

  return (
    <FlatList
      data={modules}
      keyExtractor={(item) => item.id}
      renderItem={({ item: module, index }) => {
        const isExpanded = expandedModules.includes(module.id);
        const completedCount = module.lessons.filter(l => l.completed).length;
        return (
          <View style={styles.moduleContainer}>
            <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleModule(module.id)}>
              <View style={styles.moduleNumber}><Text style={styles.moduleNumberText}>{index + 1}</Text></View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleStats}>{completedCount}/{module.lessons.length} lessons • {module.duration}</Text>
              </View>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.lessonsList}>
                {module.lessons.map((lesson) => (
                  <TouchableOpacity key={lesson.id} style={[styles.lessonItem, lesson.locked && styles.lessonLocked]} onPress={() => !lesson.locked && onLessonPress?.(lesson)} disabled={lesson.locked}>
                    <View style={[styles.lessonIcon, lesson.completed && styles.lessonIconCompleted]}>
                      {lesson.completed ? <Ionicons name="checkmark" size={14} color="#fff" /> : lesson.locked ? <Ionicons name="lock-closed" size={14} color="#9ca3af" /> : <Ionicons name={getLessonIcon(lesson.type)} size={14} color="#3b82f6" />}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[styles.lessonTitle, lesson.locked && styles.lessonTitleLocked]}>{lesson.title}</Text>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                    {!lesson.locked && <Ionicons name="chevron-forward" size={16} color="#9ca3af" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      }}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  moduleContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  moduleNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  moduleNumberText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  moduleInfo: { flex: 1, marginLeft: 12 },
  moduleTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  moduleStats: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  lessonsList: { borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  lessonItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  lessonLocked: { opacity: 0.6 },
  lessonIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  lessonIconCompleted: { backgroundColor: '#10b981' },
  lessonInfo: { flex: 1, marginLeft: 12 },
  lessonTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  lessonTitleLocked: { color: '#9ca3af' },
  lessonDuration: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// Hero Full Width (alias for HeroSection)
export { generateRNHeroSection as generateRNHeroFullWidth } from '../common';

// Hero Split Layout (alias for HeroSplit)
export { generateRNHeroSplit as generateRNHeroSplitLayout } from '../common';
