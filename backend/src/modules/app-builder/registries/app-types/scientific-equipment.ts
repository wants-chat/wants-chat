/**
 * Scientific Equipment App Type Definition
 *
 * Complete definition for scientific equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SCIENTIFIC_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'scientific-equipment',
  name: 'Scientific Equipment',
  category: 'services',
  description: 'Scientific Equipment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "scientific equipment",
      "scientific",
      "equipment",
      "scientific software",
      "scientific app",
      "scientific platform",
      "scientific system",
      "scientific management",
      "services scientific"
  ],

  synonyms: [
      "Scientific Equipment platform",
      "Scientific Equipment software",
      "Scientific Equipment system",
      "scientific solution",
      "scientific service"
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
      "Build a scientific equipment platform",
      "Create a scientific equipment app",
      "I need a scientific equipment management system",
      "Build a scientific equipment solution",
      "Create a scientific equipment booking system"
  ],
};
