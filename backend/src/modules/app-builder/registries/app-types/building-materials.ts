/**
 * Building Materials App Type Definition
 *
 * Complete definition for building materials applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BUILDING_MATERIALS_APP_TYPE: AppTypeDefinition = {
  id: 'building-materials',
  name: 'Building Materials',
  category: 'services',
  description: 'Building Materials platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "building materials",
      "building",
      "materials",
      "building software",
      "building app",
      "building platform",
      "building system",
      "building management",
      "services building"
  ],

  synonyms: [
      "Building Materials platform",
      "Building Materials software",
      "Building Materials system",
      "building solution",
      "building service"
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
      "Build a building materials platform",
      "Create a building materials app",
      "I need a building materials management system",
      "Build a building materials solution",
      "Create a building materials booking system"
  ],
};
