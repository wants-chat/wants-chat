/**
 * Money Transfer App Type Definition
 *
 * Complete definition for money transfer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MONEY_TRANSFER_APP_TYPE: AppTypeDefinition = {
  id: 'money-transfer',
  name: 'Money Transfer',
  category: 'services',
  description: 'Money Transfer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "money transfer",
      "money",
      "transfer",
      "money software",
      "money app",
      "money platform",
      "money system",
      "money management",
      "services money"
  ],

  synonyms: [
      "Money Transfer platform",
      "Money Transfer software",
      "Money Transfer system",
      "money solution",
      "money service"
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
      "Build a money transfer platform",
      "Create a money transfer app",
      "I need a money transfer management system",
      "Build a money transfer solution",
      "Create a money transfer booking system"
  ],
};
