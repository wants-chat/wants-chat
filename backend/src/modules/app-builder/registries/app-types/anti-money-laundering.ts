/**
 * Anti Money Laundering App Type Definition
 *
 * Complete definition for anti money laundering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANTI_MONEY_LAUNDERING_APP_TYPE: AppTypeDefinition = {
  id: 'anti-money-laundering',
  name: 'Anti Money Laundering',
  category: 'services',
  description: 'Anti Money Laundering platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "anti money laundering",
      "anti",
      "money",
      "laundering",
      "anti software",
      "anti app",
      "anti platform",
      "anti system",
      "anti management",
      "services anti"
  ],

  synonyms: [
      "Anti Money Laundering platform",
      "Anti Money Laundering software",
      "Anti Money Laundering system",
      "anti solution",
      "anti service"
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
      "Build a anti money laundering platform",
      "Create a anti money laundering app",
      "I need a anti money laundering management system",
      "Build a anti money laundering solution",
      "Create a anti money laundering booking system"
  ],
};
