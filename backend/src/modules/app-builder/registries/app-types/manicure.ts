/**
 * Manicure App Type Definition
 *
 * Complete definition for manicure applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MANICURE_APP_TYPE: AppTypeDefinition = {
  id: 'manicure',
  name: 'Manicure',
  category: 'services',
  description: 'Manicure platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "manicure",
      "manicure software",
      "manicure app",
      "manicure platform",
      "manicure system",
      "manicure management",
      "services manicure"
  ],

  synonyms: [
      "Manicure platform",
      "Manicure software",
      "Manicure system",
      "manicure solution",
      "manicure service"
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
      "Build a manicure platform",
      "Create a manicure app",
      "I need a manicure management system",
      "Build a manicure solution",
      "Create a manicure booking system"
  ],
};
