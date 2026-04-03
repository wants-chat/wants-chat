/**
 * Pottery Classes App Type Definition
 *
 * Complete definition for pottery classes applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POTTERY_CLASSES_APP_TYPE: AppTypeDefinition = {
  id: 'pottery-classes',
  name: 'Pottery Classes',
  category: 'services',
  description: 'Pottery Classes platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "pottery classes",
      "pottery",
      "classes",
      "pottery software",
      "pottery app",
      "pottery platform",
      "pottery system",
      "pottery management",
      "services pottery"
  ],

  synonyms: [
      "Pottery Classes platform",
      "Pottery Classes software",
      "Pottery Classes system",
      "pottery solution",
      "pottery service"
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
      "Build a pottery classes platform",
      "Create a pottery classes app",
      "I need a pottery classes management system",
      "Build a pottery classes solution",
      "Create a pottery classes booking system"
  ],
};
