/**
 * System Integration App Type Definition
 *
 * Complete definition for system integration applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYSTEM_INTEGRATION_APP_TYPE: AppTypeDefinition = {
  id: 'system-integration',
  name: 'System Integration',
  category: 'services',
  description: 'System Integration platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "system integration",
      "system",
      "integration",
      "system software",
      "system app",
      "system platform",
      "system system",
      "system management",
      "services system"
  ],

  synonyms: [
      "System Integration platform",
      "System Integration software",
      "System Integration system",
      "system solution",
      "system service"
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
      "Build a system integration platform",
      "Create a system integration app",
      "I need a system integration management system",
      "Build a system integration solution",
      "Create a system integration booking system"
  ],
};
