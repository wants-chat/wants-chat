/**
 * Reputation Management App Type Definition
 *
 * Complete definition for reputation management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REPUTATION_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'reputation-management',
  name: 'Reputation Management',
  category: 'services',
  description: 'Reputation Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "reputation management",
      "reputation",
      "management",
      "reputation software",
      "reputation app",
      "reputation platform",
      "reputation system",
      "services reputation"
  ],

  synonyms: [
      "Reputation Management platform",
      "Reputation Management software",
      "Reputation Management system",
      "reputation solution",
      "reputation service"
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
      "Build a reputation management platform",
      "Create a reputation management app",
      "I need a reputation management management system",
      "Build a reputation management solution",
      "Create a reputation management booking system"
  ],
};
