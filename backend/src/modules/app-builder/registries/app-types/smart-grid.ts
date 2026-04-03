/**
 * Smart Grid App Type Definition
 *
 * Complete definition for smart grid applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMART_GRID_APP_TYPE: AppTypeDefinition = {
  id: 'smart-grid',
  name: 'Smart Grid',
  category: 'services',
  description: 'Smart Grid platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "smart grid",
      "smart",
      "grid",
      "smart software",
      "smart app",
      "smart platform",
      "smart system",
      "smart management",
      "services smart"
  ],

  synonyms: [
      "Smart Grid platform",
      "Smart Grid software",
      "Smart Grid system",
      "smart solution",
      "smart service"
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
      "Build a smart grid platform",
      "Create a smart grid app",
      "I need a smart grid management system",
      "Build a smart grid solution",
      "Create a smart grid booking system"
  ],
};
