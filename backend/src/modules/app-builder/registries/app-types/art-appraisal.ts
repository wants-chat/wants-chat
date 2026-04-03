/**
 * Art Appraisal App Type Definition
 *
 * Complete definition for art appraisal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ART_APPRAISAL_APP_TYPE: AppTypeDefinition = {
  id: 'art-appraisal',
  name: 'Art Appraisal',
  category: 'technology',
  description: 'Art Appraisal platform with comprehensive management features',
  icon: 'code',

  keywords: [
      "art appraisal",
      "art",
      "appraisal",
      "art software",
      "art app",
      "art platform",
      "art system",
      "art management",
      "technology art"
  ],

  synonyms: [
      "Art Appraisal platform",
      "Art Appraisal software",
      "Art Appraisal system",
      "art solution",
      "art service"
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
      "Build a art appraisal platform",
      "Create a art appraisal app",
      "I need a art appraisal management system",
      "Build a art appraisal solution",
      "Create a art appraisal booking system"
  ],
};
