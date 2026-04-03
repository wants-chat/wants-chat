/**
 * Outpatient App Type Definition
 *
 * Complete definition for outpatient applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OUTPATIENT_APP_TYPE: AppTypeDefinition = {
  id: 'outpatient',
  name: 'Outpatient',
  category: 'services',
  description: 'Outpatient platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "outpatient",
      "outpatient software",
      "outpatient app",
      "outpatient platform",
      "outpatient system",
      "outpatient management",
      "services outpatient"
  ],

  synonyms: [
      "Outpatient platform",
      "Outpatient software",
      "Outpatient system",
      "outpatient solution",
      "outpatient service"
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a outpatient platform",
      "Create a outpatient app",
      "I need a outpatient management system",
      "Build a outpatient solution",
      "Create a outpatient booking system"
  ],
};
