/**
 * Utility Consulting App Type Definition
 *
 * Complete definition for utility consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const UTILITY_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'utility-consulting',
  name: 'Utility Consulting',
  category: 'professional-services',
  description: 'Utility Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "utility consulting",
      "utility",
      "consulting",
      "utility software",
      "utility app",
      "utility platform",
      "utility system",
      "utility management",
      "consulting utility"
  ],

  synonyms: [
      "Utility Consulting platform",
      "Utility Consulting software",
      "Utility Consulting system",
      "utility solution",
      "utility service"
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
      "Build a utility consulting platform",
      "Create a utility consulting app",
      "I need a utility consulting management system",
      "Build a utility consulting solution",
      "Create a utility consulting booking system"
  ],
};
