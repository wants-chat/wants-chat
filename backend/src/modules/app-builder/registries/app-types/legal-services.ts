/**
 * Legal Services App Type Definition
 *
 * Complete definition for legal services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEGAL_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'legal-services',
  name: 'Legal Services',
  category: 'legal',
  description: 'Legal Services platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "legal services",
      "legal",
      "services",
      "legal software",
      "legal app",
      "legal platform",
      "legal system",
      "legal management",
      "legal legal"
  ],

  synonyms: [
      "Legal Services platform",
      "Legal Services software",
      "Legal Services system",
      "legal solution",
      "legal service"
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
      "Build a legal services platform",
      "Create a legal services app",
      "I need a legal services management system",
      "Build a legal services solution",
      "Create a legal services booking system"
  ],
};
