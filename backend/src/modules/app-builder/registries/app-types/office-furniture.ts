/**
 * Office Furniture App Type Definition
 *
 * Complete definition for office furniture applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OFFICE_FURNITURE_APP_TYPE: AppTypeDefinition = {
  id: 'office-furniture',
  name: 'Office Furniture',
  category: 'services',
  description: 'Office Furniture platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "office furniture",
      "office",
      "furniture",
      "office software",
      "office app",
      "office platform",
      "office system",
      "office management",
      "services office"
  ],

  synonyms: [
      "Office Furniture platform",
      "Office Furniture software",
      "Office Furniture system",
      "office solution",
      "office service"
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
      "Build a office furniture platform",
      "Create a office furniture app",
      "I need a office furniture management system",
      "Build a office furniture solution",
      "Create a office furniture booking system"
  ],
};
