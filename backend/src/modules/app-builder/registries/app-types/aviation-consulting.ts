/**
 * Aviation Consulting App Type Definition
 *
 * Complete definition for aviation consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-consulting',
  name: 'Aviation Consulting',
  category: 'professional-services',
  description: 'Aviation Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "aviation consulting",
      "aviation",
      "consulting",
      "aviation software",
      "aviation app",
      "aviation platform",
      "aviation system",
      "aviation management",
      "consulting aviation"
  ],

  synonyms: [
      "Aviation Consulting platform",
      "Aviation Consulting software",
      "Aviation Consulting system",
      "aviation solution",
      "aviation service"
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
      "Build a aviation consulting platform",
      "Create a aviation consulting app",
      "I need a aviation consulting management system",
      "Build a aviation consulting solution",
      "Create a aviation consulting booking system"
  ],
};
