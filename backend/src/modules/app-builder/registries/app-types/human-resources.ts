/**
 * Human Resources App Type Definition
 *
 * Complete definition for human resources applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HUMAN_RESOURCES_APP_TYPE: AppTypeDefinition = {
  id: 'human-resources',
  name: 'Human Resources',
  category: 'services',
  description: 'Human Resources platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "human resources",
      "human",
      "resources",
      "human software",
      "human app",
      "human platform",
      "human system",
      "human management",
      "services human"
  ],

  synonyms: [
      "Human Resources platform",
      "Human Resources software",
      "Human Resources system",
      "human solution",
      "human service"
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
      "Build a human resources platform",
      "Create a human resources app",
      "I need a human resources management system",
      "Build a human resources solution",
      "Create a human resources booking system"
  ],
};
