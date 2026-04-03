/**
 * Face Painting App Type Definition
 *
 * Complete definition for face painting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FACE_PAINTING_APP_TYPE: AppTypeDefinition = {
  id: 'face-painting',
  name: 'Face Painting',
  category: 'construction',
  description: 'Face Painting platform with comprehensive management features',
  icon: 'hammer',

  keywords: [
      "face painting",
      "face",
      "painting",
      "face software",
      "face app",
      "face platform",
      "face system",
      "face management",
      "construction face"
  ],

  synonyms: [
      "Face Painting platform",
      "Face Painting software",
      "Face Painting system",
      "face solution",
      "face service"
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
      "project-bids",
      "daily-logs",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "subcontractor-mgmt",
      "material-takeoffs",
      "invoicing",
      "documents",
      "site-safety"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a face painting platform",
      "Create a face painting app",
      "I need a face painting management system",
      "Build a face painting solution",
      "Create a face painting booking system"
  ],
};
