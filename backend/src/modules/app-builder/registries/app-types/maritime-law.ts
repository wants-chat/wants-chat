/**
 * Maritime Law App Type Definition
 *
 * Complete definition for maritime law applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARITIME_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'maritime-law',
  name: 'Maritime Law',
  category: 'legal',
  description: 'Maritime Law platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "maritime law",
      "maritime",
      "law",
      "maritime software",
      "maritime app",
      "maritime platform",
      "maritime system",
      "maritime management",
      "legal maritime"
  ],

  synonyms: [
      "Maritime Law platform",
      "Maritime Law software",
      "Maritime Law system",
      "maritime solution",
      "maritime service"
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
      "Build a maritime law platform",
      "Create a maritime law app",
      "I need a maritime law management system",
      "Build a maritime law solution",
      "Create a maritime law booking system"
  ],
};
