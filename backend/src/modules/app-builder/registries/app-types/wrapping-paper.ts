/**
 * Wrapping Paper App Type Definition
 *
 * Complete definition for wrapping paper applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRAPPING_PAPER_APP_TYPE: AppTypeDefinition = {
  id: 'wrapping-paper',
  name: 'Wrapping Paper',
  category: 'technology',
  description: 'Wrapping Paper platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "wrapping paper",
      "wrapping",
      "paper",
      "wrapping software",
      "wrapping app",
      "wrapping platform",
      "wrapping system",
      "wrapping management",
      "technology wrapping"
  ],

  synonyms: [
      "Wrapping Paper platform",
      "Wrapping Paper software",
      "Wrapping Paper system",
      "wrapping solution",
      "wrapping service"
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
      "Build a wrapping paper platform",
      "Create a wrapping paper app",
      "I need a wrapping paper management system",
      "Build a wrapping paper solution",
      "Create a wrapping paper booking system"
  ],
};
