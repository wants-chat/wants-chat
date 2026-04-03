/**
 * Smart Technology App Type Definition
 *
 * Complete definition for smart technology applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SMART_TECHNOLOGY_APP_TYPE: AppTypeDefinition = {
  id: 'smart-technology',
  name: 'Smart Technology',
  category: 'technology',
  description: 'Smart Technology platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "smart technology",
      "smart",
      "technology",
      "smart software",
      "smart app",
      "smart platform",
      "smart system",
      "smart management",
      "technology smart"
  ],

  synonyms: [
      "Smart Technology platform",
      "Smart Technology software",
      "Smart Technology system",
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
      "projects",
      "tasks",
      "documents",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "time-tracking",
      "invoicing",
      "clients",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'technology',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a smart technology platform",
      "Create a smart technology app",
      "I need a smart technology management system",
      "Build a smart technology solution",
      "Create a smart technology booking system"
  ],
};
