/**
 * Legal Component Generators for React Native
 * Generates About, Contact, Legal, and Sitemap pages
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// ============================================================================
// ABOUT PAGE
// ============================================================================

export function generateRNAboutPage(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

interface AboutPageProps {
  companyName?: string;
  tagline?: string;
  description?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  teamMembers?: TeamMember[];
  foundedYear?: string;
  stats?: { label: string; value: string }[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  onContactPress?: () => void;
}

export default function AboutPage({
  companyName = 'Company Name',
  tagline = 'Building the future, together',
  description = 'We are a passionate team dedicated to creating exceptional products and services that make a difference in people\\'s lives.',
  mission = 'To deliver innovative solutions that empower individuals and businesses to achieve their full potential.',
  vision = 'A world where technology seamlessly enhances every aspect of daily life.',
  values = ['Innovation', 'Integrity', 'Excellence', 'Collaboration'],
  teamMembers = [],
  foundedYear = '2020',
  stats = [
    { label: 'Customers', value: '10K+' },
    { label: 'Countries', value: '50+' },
    { label: 'Team Members', value: '100+' },
  ],
  socialLinks = {},
  onContactPress,
}: AboutPageProps) {
  const handleSocialPress = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.tagline}>{tagline}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Stats Section */}
      {stats.length > 0 && (
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Mission & Vision */}
      <View style={styles.section}>
        <View style={styles.missionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="flag" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>{mission}</Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="eye" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.sectionText}>{vision}</Text>
        </View>
      </View>

      {/* Values */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Our Values</Text>
        <View style={styles.valuesGrid}>
          {values.map((value, index) => (
            <View key={index} style={styles.valueItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.valueText}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Meet Our Team</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teamMembers.map((member) => (
              <View key={member.id} style={styles.teamCard}>
                <Image
                  source={{ uri: member.avatar || 'https://via.placeholder.com/80' }}
                  style={styles.teamAvatar}
                />
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Company Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <Text style={styles.infoText}>Founded in {foundedYear}</Text>
          </View>
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Connect With Us</Text>
        <View style={styles.socialLinks}>
          {socialLinks.facebook && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress(socialLinks.facebook)}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
          )}
          {socialLinks.twitter && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress(socialLinks.twitter)}
            >
              <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
            </TouchableOpacity>
          )}
          {socialLinks.linkedin && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress(socialLinks.linkedin)}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0a66c2" />
            </TouchableOpacity>
          )}
          {socialLinks.instagram && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress(socialLinks.instagram)}
            >
              <Ionicons name="logo-instagram" size={24} color="#e4405f" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contact CTA */}
      {onContactPress && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Get in Touch</Text>
          <Text style={styles.ctaText}>Have questions? We'd love to hear from you.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={onContactPress}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.ctaButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  companyName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#166534',
  },
  teamCard: {
    width: 140,
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
  },
  socialSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSection: {
    marginHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 15,
    color: '#bfdbfe',
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// ABOUT PAGE CONTENT
// ============================================================================

export function generateRNAboutPageContent(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AboutPageContentProps {
  companyName?: string;
  story?: string;
  mission?: string;
  vision?: string;
  values?: { title: string; description: string }[];
  highlights?: { icon: string; title: string; description: string }[];
  image?: string;
}

export default function AboutPageContent({
  companyName = 'Company Name',
  story = 'Our journey began with a simple idea: to create products that truly make a difference. Since our founding, we have grown from a small startup to a global company, always staying true to our core values and commitment to excellence.',
  mission = 'To deliver innovative solutions that empower individuals and businesses.',
  vision = 'Building a better future through technology and innovation.',
  values = [
    { title: 'Innovation', description: 'Constantly pushing boundaries to create new solutions.' },
    { title: 'Integrity', description: 'Honest and transparent in all our dealings.' },
    { title: 'Excellence', description: 'Committed to delivering the highest quality.' },
  ],
  highlights = [
    { icon: 'people', title: 'Customer Focus', description: 'Our customers are at the heart of everything we do.' },
    { icon: 'globe', title: 'Global Reach', description: 'Serving customers in over 50 countries worldwide.' },
    { icon: 'shield-checkmark', title: 'Trust & Security', description: 'Your data and privacy are our top priority.' },
  ],
  image,
}: AboutPageContentProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About {companyName}</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Story Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        {image && (
          <Image source={{ uri: image }} style={styles.storyImage} resizeMode="cover" />
        )}
        <Text style={styles.storyText}>{story}</Text>
      </View>

      {/* Mission & Vision */}
      <View style={styles.missionVisionContainer}>
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Ionicons name="flag" size={28} color="#3b82f6" />
          </View>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>{mission}</Text>
        </View>

        <View style={[styles.missionCard, styles.visionCard]}>
          <View style={[styles.missionIcon, styles.visionIcon]}>
            <Ionicons name="eye" size={28} color="#8b5cf6" />
          </View>
          <Text style={styles.missionTitle}>Our Vision</Text>
          <Text style={styles.missionText}>{vision}</Text>
        </View>
      </View>

      {/* Values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Core Values</Text>
        {values.map((value, index) => (
          <View key={index} style={styles.valueCard}>
            <View style={styles.valueNumber}>
              <Text style={styles.valueNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>{value.title}</Text>
              <Text style={styles.valueDescription}>{value.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Highlights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Sets Us Apart</Text>
        <View style={styles.highlightsGrid}>
          {highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightCard}>
              <View style={styles.highlightIcon}>
                <Ionicons name={highlight.icon as any} size={24} color="#3b82f6" />
              </View>
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightDescription}>{highlight.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  headerLine: {
    width: 60,
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
  },
  missionVisionContainer: {
    paddingHorizontal: 24,
  },
  missionCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  visionCard: {
    backgroundColor: '#f5f3ff',
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  visionIcon: {
    backgroundColor: '#ede9fe',
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  valueNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  valueNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  highlightsGrid: {
    gap: 12,
  },
  highlightCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  highlightDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// CONTACT PAGE
// ============================================================================

export function generateRNContactPage(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactPageProps {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  onSubmit?: (data: { name: string; email: string; subject: string; message: string }) => void;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function ContactPage({
  companyName = 'Company Name',
  email = 'contact@company.com',
  phone = '+1 (555) 123-4567',
  address = '123 Business Street, City, State 12345',
  hours = 'Monday - Friday: 9:00 AM - 6:00 PM',
  onSubmit,
  socialLinks = {},
}: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    onSubmit?.(formData);
    setTimeout(() => {
      Alert.alert('Success', 'Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleEmailPress = () => Linking.openURL(\`mailto:\${email}\`);
  const handlePhonePress = () => Linking.openURL(\`tel:\${phone}\`);
  const handleAddressPress = () => {
    const query = encodeURIComponent(address);
    Linking.openURL(\`https://maps.google.com/?q=\${query}\`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <Text style={styles.headerSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </View>

        {/* Contact Info Cards */}
        <View style={styles.infoSection}>
          <TouchableOpacity style={styles.infoCard} onPress={handleEmailPress}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail" size={24} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard} onPress={handlePhonePress}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call" size={24} color="#10b981" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard} onPress={handleAddressPress}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location" size={24} color="#f59e0b" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Business Hours</Text>
              <Text style={styles.infoValue}>{hours}</Text>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send us a Message</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="How can we help?"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder="Tell us more about your inquiry..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialLinks}>
              {socialLinks.facebook && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Linking.openURL(socialLinks.facebook!)}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                </TouchableOpacity>
              )}
              {socialLinks.twitter && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Linking.openURL(socialLinks.twitter!)}
                >
                  <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
                </TouchableOpacity>
              )}
              {socialLinks.linkedin && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Linking.openURL(socialLinks.linkedin!)}
                >
                  <Ionicons name="logo-linkedin" size={24} color="#0a66c2" />
                </TouchableOpacity>
              )}
              {socialLinks.instagram && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => Linking.openURL(socialLinks.instagram!)}
                >
                  <Ionicons name="logo-instagram" size={24} color="#e4405f" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    lineHeight: 24,
  },
  infoSection: {
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  formSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  textarea: {
    height: 120,
    paddingTop: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  socialSection: {
    padding: 24,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// CONTACT PAGE CONTENT
// ============================================================================

export function generateRNContactPageContent(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
}

interface ContactPageContentProps {
  companyName?: string;
  description?: string;
  contactInfo?: ContactInfo;
  departments?: { name: string; email: string; description: string }[];
  faqs?: { question: string; answer: string }[];
}

export default function ContactPageContent({
  companyName = 'Company Name',
  description = 'Get in touch with our team. We are here to help and answer any questions you may have.',
  contactInfo = {
    email: 'contact@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
  },
  departments = [
    { name: 'Sales', email: 'sales@company.com', description: 'For product inquiries and pricing' },
    { name: 'Support', email: 'support@company.com', description: 'For technical assistance' },
    { name: 'Press', email: 'press@company.com', description: 'For media inquiries' },
  ],
  faqs = [
    { question: 'What are your response times?', answer: 'We typically respond within 24 hours.' },
    { question: 'Do you offer phone support?', answer: 'Yes, during business hours.' },
  ],
}: ContactPageContentProps) {
  const handleEmailPress = (email: string) => Linking.openURL(\`mailto:\${email}\`);
  const handlePhonePress = (phone: string) => Linking.openURL(\`tel:\${phone}\`);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact {companyName}</Text>
        <Text style={styles.headerDescription}>{description}</Text>
      </View>

      {/* Quick Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Contact</Text>

        <View style={styles.contactGrid}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handleEmailPress(contactInfo.email!)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="mail" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.contactLabel}>Email Us</Text>
            <Text style={styles.contactValue}>{contactInfo.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handlePhonePress(contactInfo.phone!)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="call" size={28} color="#10b981" />
            </View>
            <Text style={styles.contactLabel}>Call Us</Text>
            <Text style={styles.contactValue}>{contactInfo.phone}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={[styles.contactIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="location" size={24} color="#ef4444" />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Visit Us</Text>
              <Text style={styles.addressValue}>{contactInfo.address}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.addressRow}>
            <View style={[styles.contactIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time" size={24} color="#f59e0b" />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Business Hours</Text>
              <Text style={styles.addressValue}>{contactInfo.hours}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Departments */}
      {departments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Departments</Text>
          {departments.map((dept, index) => (
            <TouchableOpacity
              key={index}
              style={styles.departmentCard}
              onPress={() => handleEmailPress(dept.email)}
            >
              <View style={styles.departmentHeader}>
                <Text style={styles.departmentName}>{dept.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.departmentDescription}>{dept.description}</Text>
              <Text style={styles.departmentEmail}>{dept.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqQuestion}>
                <Ionicons name="help-circle" size={20} color="#3b82f6" />
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: '#3b82f6',
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  departmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  departmentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  departmentEmail: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    paddingLeft: 28,
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// LEGAL PAGE
// ============================================================================

export function generateRNLegalPage(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title?: string;
  type?: 'privacy' | 'terms' | 'cookies';
  lastUpdated?: string;
  companyName?: string;
  email?: string;
  address?: string;
  sections?: LegalSection[];
  onContactPress?: () => void;
}

export default function LegalPage({
  title,
  type = 'privacy',
  lastUpdated,
  companyName = 'Company Name',
  email = 'legal@company.com',
  address = '123 Business Street, City, State 12345',
  sections,
  onContactPress,
}: LegalPageProps) {
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const getDefaultTitle = () => {
    switch (type) {
      case 'terms': return 'Terms of Service';
      case 'cookies': return 'Cookie Policy';
      default: return 'Privacy Policy';
    }
  };

  const getDefaultSections = (): LegalSection[] => {
    if (type === 'terms') {
      return [
        { title: '1. Acceptance of Terms', content: 'By accessing and using this service, you accept and agree to be bound by the terms and provisions of this agreement.' },
        { title: '2. Use License', content: 'Permission is granted to temporarily use the materials on our service for personal, non-commercial transitory viewing only.' },
        { title: '3. User Accounts', content: 'When you create an account with us, you must provide accurate information. You are responsible for maintaining the confidentiality of your account.' },
        { title: '4. Prohibited Uses', content: 'You may not use our service for any unlawful purpose, to transmit harmful code, or to impersonate others.' },
        { title: '5. Termination', content: 'We may terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever.' },
        { title: '6. Limitation of Liability', content: 'In no event shall we be liable for any indirect, incidental, special, or consequential damages.' },
      ];
    }
    if (type === 'cookies') {
      return [
        { title: '1. What Are Cookies', content: 'Cookies are small text files stored on your device when you visit our website. They help us provide a better experience.' },
        { title: '2. How We Use Cookies', content: 'We use cookies for essential functionality, analytics, and to remember your preferences.' },
        { title: '3. Types of Cookies', content: 'We use essential cookies for basic functionality, analytics cookies to understand usage, and preference cookies to remember your settings.' },
        { title: '4. Managing Cookies', content: 'You can control and manage cookies in your browser settings. Note that disabling cookies may affect functionality.' },
      ];
    }
    return [
      { title: '1. Information We Collect', content: 'We collect information you provide directly, such as your name, email, and payment information when you create an account or make purchases.' },
      { title: '2. How We Use Your Information', content: 'We use information to provide and improve our services, process transactions, send notifications, and respond to inquiries.' },
      { title: '3. Information Sharing', content: 'We do not sell your personal information. We may share data with service providers, professional advisors, or when required by law.' },
      { title: '4. Data Security', content: 'We implement appropriate technical and organizational measures to protect your personal information.' },
      { title: '5. Your Rights', content: 'You have the right to access, update, or delete your personal information. You may also object to certain processing of your data.' },
      { title: '6. Changes to This Policy', content: 'We may update this policy from time to time. We will notify you of changes by posting the new policy on this page.' },
    ];
  };

  const displaySections = sections || getDefaultSections();
  const displayTitle = title || getDefaultTitle();
  const displayDate = lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{displayTitle}</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.dateText}>Last updated: {displayDate}</Text>
        </View>
      </View>

      {/* Sections */}
      <View style={styles.sectionsContainer}>
        {displaySections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons
                name={expandedSections.includes(index) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
            {expandedSections.includes(index) && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>{section.content}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Questions?</Text>
        <Text style={styles.contactText}>
          If you have any questions about this {type === 'terms' ? 'Terms of Service' : type === 'cookies' ? 'Cookie Policy' : 'Privacy Policy'}, please contact us:
        </Text>
        <View style={styles.contactCard}>
          <Text style={styles.companyName}>{companyName}</Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={16} color="#3b82f6" />
            <Text style={styles.contactEmail}>{email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.contactAddress}>{address}</Text>
          </View>
        </View>
        {onContactPress && (
          <TouchableOpacity style={styles.contactButton} onPress={onContactPress}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Us</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
  },
  sectionsContainer: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  contactSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#3b82f6',
  },
  contactAddress: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React, { useState } from 'react';",
      "import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// LEGAL PAGE CONTENT
// ============================================================================

export function generateRNLegalPageContent(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LegalSection {
  id: string;
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

interface LegalPageContentProps {
  title?: string;
  lastUpdated?: string;
  sections?: LegalSection[];
  introduction?: string;
}

export default function LegalPageContent({
  title = 'Privacy Policy',
  lastUpdated,
  sections = [
    {
      id: '1',
      title: 'Information We Collect',
      content: 'We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us for support.',
      subsections: [
        { title: 'Personal Information', content: 'Name, email address, phone number, and billing information.' },
        { title: 'Usage Data', content: 'Information about how you use our services and interact with our platform.' },
      ],
    },
    {
      id: '2',
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services.',
    },
    {
      id: '3',
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.',
    },
    {
      id: '4',
      title: 'Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information.',
    },
    {
      id: '5',
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information at any time.',
    },
  ],
  introduction = 'This document outlines our policies regarding the collection, use, and disclosure of information.',
}: LegalPageContentProps) {
  const displayDate = lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.dateBadge}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.dateText}>Updated: {displayDate}</Text>
          </View>
        </View>
      </View>

      {/* Introduction */}
      <View style={styles.introSection}>
        <View style={styles.introIcon}>
          <Ionicons name="document-text" size={24} color="#3b82f6" />
        </View>
        <Text style={styles.introText}>{introduction}</Text>
      </View>

      {/* Sections */}
      <View style={styles.content}>
        {sections.map((section, index) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <Text style={styles.sectionContent}>{section.content}</Text>

            {section.subsections && section.subsections.length > 0 && (
              <View style={styles.subsections}>
                {section.subsections.map((sub, subIndex) => (
                  <View key={subIndex} style={styles.subsection}>
                    <View style={styles.bulletPoint} />
                    <View style={styles.subsectionContent}>
                      <Text style={styles.subsectionTitle}>{sub.title}</Text>
                      <Text style={styles.subsectionText}>{sub.content}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Ionicons name="information-circle" size={20} color="#6b7280" />
        <Text style={styles.footerText}>
          If you have any questions about this policy, please contact our support team.
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#6b7280',
  },
  introSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    backgroundColor: '#eff6ff',
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    fontSize: 15,
    color: '#1e40af',
    lineHeight: 22,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  sectionContent: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  subsections: {
    marginTop: 16,
    paddingLeft: 8,
  },
  subsection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 8,
    marginRight: 12,
  },
  subsectionContent: {
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subsectionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, ScrollView, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}

// ============================================================================
// SITEMAP CONTENT
// ============================================================================

export function generateRNSitemapContent(
  resolved: ResolvedComponent,
  variant: string = 'minimal'
): { code: string; imports: string[] } {
  const code = `import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SitemapLink {
  title: string;
  description?: string;
  route?: string;
}

interface SitemapSection {
  title: string;
  icon?: string;
  links: SitemapLink[];
}

interface SitemapContentProps {
  title?: string;
  description?: string;
  sections?: SitemapSection[];
  onNavigate?: (route: string) => void;
}

export default function SitemapContent({
  title = 'Sitemap',
  description = 'Find your way around our app with this complete overview of all available pages.',
  sections = [
    {
      title: 'Main',
      icon: 'home',
      links: [
        { title: 'Home', description: 'Main landing page', route: '/home' },
        { title: 'Dashboard', description: 'Your personal dashboard', route: '/dashboard' },
        { title: 'Search', description: 'Find what you need', route: '/search' },
      ],
    },
    {
      title: 'Account',
      icon: 'person',
      links: [
        { title: 'Profile', description: 'View and edit your profile', route: '/profile' },
        { title: 'Settings', description: 'App preferences', route: '/settings' },
        { title: 'Notifications', description: 'Manage notifications', route: '/notifications' },
      ],
    },
    {
      title: 'Support',
      icon: 'help-circle',
      links: [
        { title: 'Help Center', description: 'Get answers to common questions', route: '/help' },
        { title: 'Contact Us', description: 'Reach out to our team', route: '/contact' },
        { title: 'FAQ', description: 'Frequently asked questions', route: '/faq' },
      ],
    },
    {
      title: 'Legal',
      icon: 'document-text',
      links: [
        { title: 'Privacy Policy', description: 'How we protect your data', route: '/privacy' },
        { title: 'Terms of Service', description: 'Terms and conditions', route: '/terms' },
        { title: 'Cookie Policy', description: 'How we use cookies', route: '/cookies' },
      ],
    },
  ],
  onNavigate,
}: SitemapContentProps) {
  const handlePress = (route?: string) => {
    if (route && onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="map" size={32} color="#3b82f6" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Sections */}
      <View style={styles.sectionsContainer}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name={(section.icon as any) || 'folder'} size={20} color="#3b82f6" />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.linksList}>
              {section.links.map((link, linkIndex) => (
                <TouchableOpacity
                  key={linkIndex}
                  style={styles.linkItem}
                  onPress={() => handlePress(link.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.linkContent}>
                    <Text style={styles.linkTitle}>{link.title}</Text>
                    {link.description && (
                      <Text style={styles.linkDescription}>{link.description}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Can't find what you're looking for?
        </Text>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handlePress('/contact')}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#3b82f6" />
          <Text style={styles.footerButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  sectionsContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  linksList: {
    paddingVertical: 4,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  linkDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 12,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
  bottomPadding: {
    height: 40,
  },
});`;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
}
