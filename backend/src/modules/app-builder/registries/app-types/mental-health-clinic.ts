/**
 * Mental Health Clinic App Type Definition
 *
 * Complete definition for mental health clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MENTAL_HEALTH_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'mental-health-clinic',
  name: 'Mental Health Clinic',
  category: 'healthcare',
  description: 'Mental Health Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "mental health clinic",
      "mental",
      "health",
      "clinic",
      "mental software",
      "mental app",
      "mental platform",
      "mental system",
      "mental management",
      "healthcare mental"
  ],

  synonyms: [
      "Mental Health Clinic platform",
      "Mental Health Clinic software",
      "Mental Health Clinic system",
      "mental solution",
      "mental service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Practice Owner",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "patient-records",
      "calendar",
      "check-in",
      "notifications"
  ],

  optionalFeatures: [
      "insurance-billing",
      "prescriptions",
      "telemedicine",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a mental health clinic platform",
      "Create a mental health clinic app",
      "I need a mental health clinic management system",
      "Build a mental health clinic solution",
      "Create a mental health clinic booking system"
  ],
};
