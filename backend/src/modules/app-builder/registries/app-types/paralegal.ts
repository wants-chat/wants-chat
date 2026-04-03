/**
 * Paralegal App Type Definition
 *
 * Complete definition for paralegal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARALEGAL_APP_TYPE: AppTypeDefinition = {
  id: 'paralegal',
  name: 'Paralegal',
  category: 'legal',
  description: 'Paralegal platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "paralegal",
      "paralegal software",
      "paralegal app",
      "paralegal platform",
      "paralegal system",
      "paralegal management",
      "legal paralegal"
  ],

  synonyms: [
      "Paralegal platform",
      "Paralegal software",
      "Paralegal system",
      "paralegal solution",
      "paralegal service"
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
      "Build a paralegal platform",
      "Create a paralegal app",
      "I need a paralegal management system",
      "Build a paralegal solution",
      "Create a paralegal booking system"
  ],
};
