/**
 * Veal Processing App Type Definition
 *
 * Complete definition for veal processing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VEAL_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'veal-processing',
  name: 'Veal Processing',
  category: 'services',
  description: 'Veal Processing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "veal processing",
      "veal",
      "processing",
      "veal software",
      "veal app",
      "veal platform",
      "veal system",
      "veal management",
      "services veal"
  ],

  synonyms: [
      "Veal Processing platform",
      "Veal Processing software",
      "Veal Processing system",
      "veal solution",
      "veal service"
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
      "Build a veal processing platform",
      "Create a veal processing app",
      "I need a veal processing management system",
      "Build a veal processing solution",
      "Create a veal processing booking system"
  ],
};
