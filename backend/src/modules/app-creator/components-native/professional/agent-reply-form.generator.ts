/**
 * Agent Reply Form Component Generator (React Native)
 *
 * Generates a ticket reply form for support agents.
 * Features: Text input, internal note toggle, templates, attachments support.
 */

export interface AgentReplyFormOptions {
  componentName?: string;
  onSubmitEndpoint?: string;
}

export function generateAgentReplyForm(options: AgentReplyFormOptions = {}): string {
  const {
    componentName = 'AgentReplyForm',
    onSubmitEndpoint = '/tickets',
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  content: string;
}

interface ${componentName}Props {
  ticketId: string;
  onSubmitSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ ticketId, onSubmitSuccess }) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const templates: Template[] = [
    { id: '1', name: 'Greeting', content: 'Hello! Thank you for contacting us.' },
    { id: '2', name: 'Resolution', content: 'We have resolved your issue. Please let us know if you need further assistance.' },
    { id: '3', name: 'Escalation', content: 'I have escalated your ticket to our senior team. You will hear back within 24 hours.' },
    { id: '4', name: 'More Info', content: 'Could you please provide more details about the issue you are experiencing?' },
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: { message: string; isInternal: boolean }) => {
      return api.post(\`${onSubmitEndpoint}/\${ticketId}/replies\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setMessage('');
      setIsInternal(false);
      onSubmitSuccess?.();
      Alert.alert('Success', isInternal ? 'Internal note added' : 'Reply sent successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to send reply. Please try again.');
    },
  });

  const handleTemplateSelect = (template: Template) => {
    setMessage((prev) => (prev ? prev + '\\n\\n' + template.content : template.content));
    setShowTemplates(false);
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    submitMutation.mutate({ message: message.trim(), isInternal });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.card, isInternal && styles.cardInternal]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Reply to Ticket #{ticketId}
          </Text>
          <View style={styles.internalToggle}>
            <Text style={styles.internalLabel}>Internal Note</Text>
            <Switch
              value={isInternal}
              onValueChange={setIsInternal}
              trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
              thumbColor={isInternal ? '#F59E0B' : '#FFFFFF'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.templatesButton}
          onPress={() => setShowTemplates(!showTemplates)}
        >
          <Ionicons name="document-text-outline" size={16} color="#6B7280" />
          <Text style={styles.templatesButtonText}>Templates</Text>
          <Ionicons
            name={showTemplates ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6B7280"
          />
        </TouchableOpacity>

        {showTemplates && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templatesContainer}
          >
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateChip}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={styles.templateChipText}>{template.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TextInput
          style={[styles.textInput, isInternal && styles.textInputInternal]}
          placeholder={isInternal ? 'Add internal note...' : 'Type your reply...'}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isInternal && styles.submitButtonInternal,
              submitMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Ionicons
                  name={isInternal ? 'document-text' : 'send'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>
                  {isInternal ? 'Add Note' : 'Send Reply'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInternal: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  internalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  internalLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  templatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  templatesButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  templatesContainer: {
    marginBottom: 12,
  },
  templateChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  templateChipText: {
    fontSize: 13,
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 150,
    marginBottom: 16,
  },
  textInputInternal: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonInternal: {
    backgroundColor: '#F59E0B',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
