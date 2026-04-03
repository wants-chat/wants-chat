/**
 * Trauma Center App Type Definition
 *
 * Complete definition for trauma center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAUMA_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'trauma-center',
  name: 'Trauma Center',
  category: 'services',
  description: 'Trauma Center platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "trauma center",
      "trauma",
      "center",
      "trauma software",
      "trauma app",
      "trauma platform",
      "trauma system",
      "trauma management",
      "services trauma"
  ],

  synonyms: [
      "Trauma Center platform",
      "Trauma Center software",
      "Trauma Center system",
      "trauma solution",
      "trauma service"
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
      "Build a trauma center platform",
      "Create a trauma center app",
      "I need a trauma center management system",
      "Build a trauma center solution",
      "Create a trauma center booking system"
  ],
};
