/**
 * Furniture Assembly App Type Definition
 *
 * Complete definition for furniture assembly applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FURNITURE_ASSEMBLY_APP_TYPE: AppTypeDefinition = {
  id: 'furniture-assembly',
  name: 'Furniture Assembly',
  category: 'services',
  description: 'Furniture Assembly platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "furniture assembly",
      "furniture",
      "assembly",
      "furniture software",
      "furniture app",
      "furniture platform",
      "furniture system",
      "furniture management",
      "services furniture"
  ],

  synonyms: [
      "Furniture Assembly platform",
      "Furniture Assembly software",
      "Furniture Assembly system",
      "furniture solution",
      "furniture service"
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
      "Build a furniture assembly platform",
      "Create a furniture assembly app",
      "I need a furniture assembly management system",
      "Build a furniture assembly solution",
      "Create a furniture assembly booking system"
  ],
};
