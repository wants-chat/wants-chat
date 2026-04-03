/**
 * Record Label App Type Definition
 *
 * Complete definition for record label applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECORD_LABEL_APP_TYPE: AppTypeDefinition = {
  id: 'record-label',
  name: 'Record Label',
  category: 'services',
  description: 'Record Label platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "record label",
      "record",
      "label",
      "record software",
      "record app",
      "record platform",
      "record system",
      "record management",
      "services record"
  ],

  synonyms: [
      "Record Label platform",
      "Record Label software",
      "Record Label system",
      "record solution",
      "record service"
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
      "Build a record label platform",
      "Create a record label app",
      "I need a record label management system",
      "Build a record label solution",
      "Create a record label booking system"
  ],
};
