/**
 * Probate Law App Type Definition
 *
 * Complete definition for probate law applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROBATE_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'probate-law',
  name: 'Probate Law',
  category: 'legal',
  description: 'Probate Law platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "probate law",
      "probate",
      "law",
      "probate software",
      "probate app",
      "probate platform",
      "probate system",
      "probate management",
      "legal probate"
  ],

  synonyms: [
      "Probate Law platform",
      "Probate Law software",
      "Probate Law system",
      "probate solution",
      "probate service"
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
          "name": "Managing Partner",
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
          "name": "Attorney",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
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
      "case-management",
      "client-intake",
      "billing-timekeeping",
      "documents",
      "notifications"
  ],

  optionalFeatures: [
      "court-calendar",
      "document-assembly",
      "conflict-check",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a probate law platform",
      "Create a probate law app",
      "I need a probate law management system",
      "Build a probate law solution",
      "Create a probate law booking system"
  ],
};
