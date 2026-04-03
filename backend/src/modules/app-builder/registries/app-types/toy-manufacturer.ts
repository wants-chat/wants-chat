/**
 * Toy Manufacturer App Type Definition
 *
 * Complete definition for toy manufacturer applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TOY_MANUFACTURER_APP_TYPE: AppTypeDefinition = {
  id: 'toy-manufacturer',
  name: 'Toy Manufacturer',
  category: 'services',
  description: 'Toy Manufacturer platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "toy manufacturer",
      "toy",
      "manufacturer",
      "toy software",
      "toy app",
      "toy platform",
      "toy system",
      "toy management",
      "services toy"
  ],

  synonyms: [
      "Toy Manufacturer platform",
      "Toy Manufacturer software",
      "Toy Manufacturer system",
      "toy solution",
      "toy service"
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
      "Build a toy manufacturer platform",
      "Create a toy manufacturer app",
      "I need a toy manufacturer management system",
      "Build a toy manufacturer solution",
      "Create a toy manufacturer booking system"
  ],
};
