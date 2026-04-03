/**
 * Political Consulting App Type Definition
 *
 * Complete definition for political consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POLITICAL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'political-consulting',
  name: 'Political Consulting',
  category: 'professional-services',
  description: 'Political Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "political consulting",
      "political",
      "consulting",
      "political software",
      "political app",
      "political platform",
      "political system",
      "political management",
      "consulting political"
  ],

  synonyms: [
      "Political Consulting platform",
      "Political Consulting software",
      "Political Consulting system",
      "political solution",
      "political service"
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
      "Build a political consulting platform",
      "Create a political consulting app",
      "I need a political consulting management system",
      "Build a political consulting solution",
      "Create a political consulting booking system"
  ],
};
