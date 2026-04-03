/**
 * Sewing Classes App Type Definition
 *
 * Complete definition for sewing classes applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEWING_CLASSES_APP_TYPE: AppTypeDefinition = {
  id: 'sewing-classes',
  name: 'Sewing Classes',
  category: 'services',
  description: 'Sewing Classes platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sewing classes",
      "sewing",
      "classes",
      "sewing software",
      "sewing app",
      "sewing platform",
      "sewing system",
      "sewing management",
      "services sewing"
  ],

  synonyms: [
      "Sewing Classes platform",
      "Sewing Classes software",
      "Sewing Classes system",
      "sewing solution",
      "sewing service"
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
      "Build a sewing classes platform",
      "Create a sewing classes app",
      "I need a sewing classes management system",
      "Build a sewing classes solution",
      "Create a sewing classes booking system"
  ],
};
