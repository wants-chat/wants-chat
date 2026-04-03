/**
 * Naturopathy App Type Definition
 *
 * Complete definition for naturopathy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NATUROPATHY_APP_TYPE: AppTypeDefinition = {
  id: 'naturopathy',
  name: 'Naturopathy',
  category: 'services',
  description: 'Naturopathy platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "naturopathy",
      "naturopathy software",
      "naturopathy app",
      "naturopathy platform",
      "naturopathy system",
      "naturopathy management",
      "services naturopathy"
  ],

  synonyms: [
      "Naturopathy platform",
      "Naturopathy software",
      "Naturopathy system",
      "naturopathy solution",
      "naturopathy service"
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
      "Build a naturopathy platform",
      "Create a naturopathy app",
      "I need a naturopathy management system",
      "Build a naturopathy solution",
      "Create a naturopathy booking system"
  ],
};
