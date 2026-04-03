/**
 * Nonprofit Management App Type Definition
 *
 * Complete definition for nonprofit management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NONPROFIT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'nonprofit-management',
  name: 'Nonprofit Management',
  category: 'nonprofit',
  description: 'Nonprofit Management platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "nonprofit management",
      "nonprofit",
      "management",
      "nonprofit software",
      "nonprofit app",
      "nonprofit platform",
      "nonprofit system",
      "nonprofit nonprofit"
  ],

  synonyms: [
      "Nonprofit Management platform",
      "Nonprofit Management software",
      "Nonprofit Management system",
      "nonprofit solution",
      "nonprofit service"
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
      "crm",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "messaging",
      "blog",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'nonprofit',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'warm',

  examplePrompts: [
      "Build a nonprofit management platform",
      "Create a nonprofit management app",
      "I need a nonprofit management management system",
      "Build a nonprofit management solution",
      "Create a nonprofit management booking system"
  ],
};
