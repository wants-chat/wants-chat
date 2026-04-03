/**
 * Meat Processing App Type Definition
 *
 * Complete definition for meat processing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEAT_PROCESSING_APP_TYPE: AppTypeDefinition = {
  id: 'meat-processing',
  name: 'Meat Processing',
  category: 'services',
  description: 'Meat Processing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "meat processing",
      "meat",
      "processing",
      "meat software",
      "meat app",
      "meat platform",
      "meat system",
      "meat management",
      "services meat"
  ],

  synonyms: [
      "Meat Processing platform",
      "Meat Processing software",
      "Meat Processing system",
      "meat solution",
      "meat service"
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
      "Build a meat processing platform",
      "Create a meat processing app",
      "I need a meat processing management system",
      "Build a meat processing solution",
      "Create a meat processing booking system"
  ],
};
