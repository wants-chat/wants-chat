/**
 * Prosthetics App Type Definition
 *
 * Complete definition for prosthetics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROSTHETICS_APP_TYPE: AppTypeDefinition = {
  id: 'prosthetics',
  name: 'Prosthetics',
  category: 'services',
  description: 'Prosthetics platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "prosthetics",
      "prosthetics software",
      "prosthetics app",
      "prosthetics platform",
      "prosthetics system",
      "prosthetics management",
      "services prosthetics"
  ],

  synonyms: [
      "Prosthetics platform",
      "Prosthetics software",
      "Prosthetics system",
      "prosthetics solution",
      "prosthetics service"
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
      "Build a prosthetics platform",
      "Create a prosthetics app",
      "I need a prosthetics management system",
      "Build a prosthetics solution",
      "Create a prosthetics booking system"
  ],
};
