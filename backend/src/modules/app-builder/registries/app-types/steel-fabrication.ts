/**
 * Steel Fabrication App Type Definition
 *
 * Complete definition for steel fabrication applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STEEL_FABRICATION_APP_TYPE: AppTypeDefinition = {
  id: 'steel-fabrication',
  name: 'Steel Fabrication',
  category: 'services',
  description: 'Steel Fabrication platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "steel fabrication",
      "steel",
      "fabrication",
      "steel software",
      "steel app",
      "steel platform",
      "steel system",
      "steel management",
      "services steel"
  ],

  synonyms: [
      "Steel Fabrication platform",
      "Steel Fabrication software",
      "Steel Fabrication system",
      "steel solution",
      "steel service"
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
      "Build a steel fabrication platform",
      "Create a steel fabrication app",
      "I need a steel fabrication management system",
      "Build a steel fabrication solution",
      "Create a steel fabrication booking system"
  ],
};
