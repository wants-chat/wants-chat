/**
 * Sustainable Energy App Type Definition
 *
 * Complete definition for sustainable energy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUSTAINABLE_ENERGY_APP_TYPE: AppTypeDefinition = {
  id: 'sustainable-energy',
  name: 'Sustainable Energy',
  category: 'services',
  description: 'Sustainable Energy platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "sustainable energy",
      "sustainable",
      "energy",
      "sustainable software",
      "sustainable app",
      "sustainable platform",
      "sustainable system",
      "sustainable management",
      "services sustainable"
  ],

  synonyms: [
      "Sustainable Energy platform",
      "Sustainable Energy software",
      "Sustainable Energy system",
      "sustainable solution",
      "sustainable service"
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
      "Build a sustainable energy platform",
      "Create a sustainable energy app",
      "I need a sustainable energy management system",
      "Build a sustainable energy solution",
      "Create a sustainable energy booking system"
  ],
};
