/**
 * Corporate Law App Type Definition
 *
 * Complete definition for corporate law applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CORPORATE_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'corporate-law',
  name: 'Corporate Law',
  category: 'legal',
  description: 'Corporate Law platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "corporate law",
      "corporate",
      "law",
      "corporate software",
      "corporate app",
      "corporate platform",
      "corporate system",
      "corporate management",
      "legal corporate"
  ],

  synonyms: [
      "Corporate Law platform",
      "Corporate Law software",
      "Corporate Law system",
      "corporate solution",
      "corporate service"
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
      "Build a corporate law platform",
      "Create a corporate law app",
      "I need a corporate law management system",
      "Build a corporate law solution",
      "Create a corporate law booking system"
  ],
};
