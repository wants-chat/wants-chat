/**
 * Systems Consulting App Type Definition
 *
 * Complete definition for systems consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SYSTEMS_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'systems-consulting',
  name: 'Systems Consulting',
  category: 'professional-services',
  description: 'Systems Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "systems consulting",
      "systems",
      "consulting",
      "systems software",
      "systems app",
      "systems platform",
      "systems system",
      "systems management",
      "consulting systems"
  ],

  synonyms: [
      "Systems Consulting platform",
      "Systems Consulting software",
      "Systems Consulting system",
      "systems solution",
      "systems service"
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
      "Build a systems consulting platform",
      "Create a systems consulting app",
      "I need a systems consulting management system",
      "Build a systems consulting solution",
      "Create a systems consulting booking system"
  ],
};
