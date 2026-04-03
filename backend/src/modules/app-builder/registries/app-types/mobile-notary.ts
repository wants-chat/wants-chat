/**
 * Mobile Notary App Type Definition
 *
 * Complete definition for mobile notary applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_NOTARY_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-notary',
  name: 'Mobile Notary',
  category: 'legal',
  description: 'Mobile Notary platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "mobile notary",
      "mobile",
      "notary",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "legal mobile"
  ],

  synonyms: [
      "Mobile Notary platform",
      "Mobile Notary software",
      "Mobile Notary system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile notary platform",
      "Create a mobile notary app",
      "I need a mobile notary management system",
      "Build a mobile notary solution",
      "Create a mobile notary booking system"
  ],
};
