/**
 * Group Therapy App Type Definition
 *
 * Complete definition for group therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GROUP_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'group-therapy',
  name: 'Group Therapy',
  category: 'healthcare',
  description: 'Group Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "group therapy",
      "group",
      "therapy",
      "group software",
      "group app",
      "group platform",
      "group system",
      "group management",
      "healthcare group"
  ],

  synonyms: [
      "Group Therapy platform",
      "Group Therapy software",
      "Group Therapy system",
      "group solution",
      "group service"
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
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a group therapy platform",
      "Create a group therapy app",
      "I need a group therapy management system",
      "Build a group therapy solution",
      "Create a group therapy booking system"
  ],
};
