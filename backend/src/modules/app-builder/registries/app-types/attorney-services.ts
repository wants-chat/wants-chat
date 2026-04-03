/**
 * Attorney Services App Type Definition
 *
 * Complete definition for attorney services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATTORNEY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'attorney-services',
  name: 'Attorney Services',
  category: 'legal',
  description: 'Attorney Services platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "attorney services",
      "attorney",
      "services",
      "attorney software",
      "attorney app",
      "attorney platform",
      "attorney system",
      "attorney management",
      "legal attorney"
  ],

  synonyms: [
      "Attorney Services platform",
      "Attorney Services software",
      "Attorney Services system",
      "attorney solution",
      "attorney service"
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
      "Build a attorney services platform",
      "Create a attorney services app",
      "I need a attorney services management system",
      "Build a attorney services solution",
      "Create a attorney services booking system"
  ],
};
