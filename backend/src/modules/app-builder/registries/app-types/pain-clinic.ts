/**
 * Pain Clinic App Type Definition
 *
 * Complete definition for pain clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAIN_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'pain-clinic',
  name: 'Pain Clinic',
  category: 'healthcare',
  description: 'Pain Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "pain clinic",
      "pain",
      "clinic",
      "pain software",
      "pain app",
      "pain platform",
      "pain system",
      "pain management",
      "healthcare pain"
  ],

  synonyms: [
      "Pain Clinic platform",
      "Pain Clinic software",
      "Pain Clinic system",
      "pain solution",
      "pain service"
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
      "Build a pain clinic platform",
      "Create a pain clinic app",
      "I need a pain clinic management system",
      "Build a pain clinic solution",
      "Create a pain clinic booking system"
  ],
};
