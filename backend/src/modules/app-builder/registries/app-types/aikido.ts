/**
 * Aikido App Type Definition
 *
 * Complete definition for aikido applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIKIDO_APP_TYPE: AppTypeDefinition = {
  id: 'aikido',
  name: 'Aikido',
  category: 'services',
  description: 'Aikido platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aikido",
      "aikido software",
      "aikido app",
      "aikido platform",
      "aikido system",
      "aikido management",
      "services aikido"
  ],

  synonyms: [
      "Aikido platform",
      "Aikido software",
      "Aikido system",
      "aikido solution",
      "aikido service"
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
      "Build a aikido platform",
      "Create a aikido app",
      "I need a aikido management system",
      "Build a aikido solution",
      "Create a aikido booking system"
  ],
};
