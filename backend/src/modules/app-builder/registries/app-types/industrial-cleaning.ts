/**
 * Industrial Cleaning App Type Definition
 *
 * Complete definition for industrial cleaning applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDUSTRIAL_CLEANING_APP_TYPE: AppTypeDefinition = {
  id: 'industrial-cleaning',
  name: 'Industrial Cleaning',
  category: 'services',
  description: 'Industrial Cleaning platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "industrial cleaning",
      "industrial",
      "cleaning",
      "industrial software",
      "industrial app",
      "industrial platform",
      "industrial system",
      "industrial management",
      "services industrial"
  ],

  synonyms: [
      "Industrial Cleaning platform",
      "Industrial Cleaning software",
      "Industrial Cleaning system",
      "industrial solution",
      "industrial service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a industrial cleaning platform",
      "Create a industrial cleaning app",
      "I need a industrial cleaning management system",
      "Build a industrial cleaning solution",
      "Create a industrial cleaning booking system"
  ],
};
