/**
 * Jewelry Appraisal App Type Definition
 *
 * Complete definition for jewelry appraisal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const JEWELRY_APPRAISAL_APP_TYPE: AppTypeDefinition = {
  id: 'jewelry-appraisal',
  name: 'Jewelry Appraisal',
  category: 'technology',
  description: 'Jewelry Appraisal platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "jewelry appraisal",
      "jewelry",
      "appraisal",
      "jewelry software",
      "jewelry app",
      "jewelry platform",
      "jewelry system",
      "jewelry management",
      "technology jewelry"
  ],

  synonyms: [
      "Jewelry Appraisal platform",
      "Jewelry Appraisal software",
      "Jewelry Appraisal system",
      "jewelry solution",
      "jewelry service"
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
      "Build a jewelry appraisal platform",
      "Create a jewelry appraisal app",
      "I need a jewelry appraisal management system",
      "Build a jewelry appraisal solution",
      "Create a jewelry appraisal booking system"
  ],
};
