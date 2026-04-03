/**
 * Xeriscaping App Type Definition
 *
 * Complete definition for xeriscaping applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const XERISCAPING_APP_TYPE: AppTypeDefinition = {
  id: 'xeriscaping',
  name: 'Xeriscaping',
  category: 'services',
  description: 'Xeriscaping platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "xeriscaping",
      "xeriscaping software",
      "xeriscaping app",
      "xeriscaping platform",
      "xeriscaping system",
      "xeriscaping management",
      "services xeriscaping"
  ],

  synonyms: [
      "Xeriscaping platform",
      "Xeriscaping software",
      "Xeriscaping system",
      "xeriscaping solution",
      "xeriscaping service"
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
      "Build a xeriscaping platform",
      "Create a xeriscaping app",
      "I need a xeriscaping management system",
      "Build a xeriscaping solution",
      "Create a xeriscaping booking system"
  ],
};
