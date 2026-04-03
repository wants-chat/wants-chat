/**
 * Writing Coaching App Type Definition
 *
 * Complete definition for writing coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRITING_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'writing-coaching',
  name: 'Writing Coaching',
  category: 'professional-services',
  description: 'Writing Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "writing coaching",
      "writing",
      "coaching",
      "writing software",
      "writing app",
      "writing platform",
      "writing system",
      "writing management",
      "consulting writing"
  ],

  synonyms: [
      "Writing Coaching platform",
      "Writing Coaching software",
      "Writing Coaching system",
      "writing solution",
      "writing service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a writing coaching platform",
      "Create a writing coaching app",
      "I need a writing coaching management system",
      "Build a writing coaching solution",
      "Create a writing coaching booking system"
  ],
};
