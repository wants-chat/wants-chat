/**
 * Wrecking Yard App Type Definition
 *
 * Complete definition for wrecking yard applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WRECKING_YARD_APP_TYPE: AppTypeDefinition = {
  id: 'wrecking-yard',
  name: 'Wrecking Yard',
  category: 'services',
  description: 'Wrecking Yard platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wrecking yard",
      "wrecking",
      "yard",
      "wrecking software",
      "wrecking app",
      "wrecking platform",
      "wrecking system",
      "wrecking management",
      "services wrecking"
  ],

  synonyms: [
      "Wrecking Yard platform",
      "Wrecking Yard software",
      "Wrecking Yard system",
      "wrecking solution",
      "wrecking service"
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
      "Build a wrecking yard platform",
      "Create a wrecking yard app",
      "I need a wrecking yard management system",
      "Build a wrecking yard solution",
      "Create a wrecking yard booking system"
  ],
};
