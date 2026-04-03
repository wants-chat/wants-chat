/**
 * Wellness Program App Type Definition
 *
 * Complete definition for wellness program applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELLNESS_PROGRAM_APP_TYPE: AppTypeDefinition = {
  id: 'wellness-program',
  name: 'Wellness Program',
  category: 'wellness',
  description: 'Wellness Program platform with comprehensive management features',
  icon: 'leaf',

  keywords: [
      "wellness program",
      "wellness",
      "program",
      "wellness software",
      "wellness app",
      "wellness platform",
      "wellness system",
      "wellness management",
      "wellness wellness"
  ],

  synonyms: [
      "Wellness Program platform",
      "Wellness Program software",
      "Wellness Program system",
      "wellness solution",
      "wellness service"
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
      "search",
      "gallery"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "blog",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'natural',

  examplePrompts: [
      "Build a wellness program platform",
      "Create a wellness program app",
      "I need a wellness program management system",
      "Build a wellness program solution",
      "Create a wellness program booking system"
  ],
};
