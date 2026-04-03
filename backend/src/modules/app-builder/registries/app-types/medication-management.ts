/**
 * Medication Management App Type Definition
 *
 * Complete definition for medication management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEDICATION_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'medication-management',
  name: 'Medication Management',
  category: 'services',
  description: 'Medication Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "medication management",
      "medication",
      "management",
      "medication software",
      "medication app",
      "medication platform",
      "medication system",
      "services medication"
  ],

  synonyms: [
      "Medication Management platform",
      "Medication Management software",
      "Medication Management system",
      "medication solution",
      "medication service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a medication management platform",
      "Create a medication management app",
      "I need a medication management management system",
      "Build a medication management solution",
      "Create a medication management booking system"
  ],
};
