/**
 * Appearance Attorney App Type Definition
 *
 * Complete definition for appearance attorney applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APPEARANCE_ATTORNEY_APP_TYPE: AppTypeDefinition = {
  id: 'appearance-attorney',
  name: 'Appearance Attorney',
  category: 'legal',
  description: 'Appearance Attorney platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "appearance attorney",
      "appearance",
      "attorney",
      "appearance software",
      "appearance app",
      "appearance platform",
      "appearance system",
      "appearance management",
      "legal appearance"
  ],

  synonyms: [
      "Appearance Attorney platform",
      "Appearance Attorney software",
      "Appearance Attorney system",
      "appearance solution",
      "appearance service"
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
      "Build a appearance attorney platform",
      "Create a appearance attorney app",
      "I need a appearance attorney management system",
      "Build a appearance attorney solution",
      "Create a appearance attorney booking system"
  ],
};
