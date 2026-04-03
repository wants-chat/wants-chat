/**
 * Physician Practice App Type Definition
 *
 * Complete definition for physician practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PHYSICIAN_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'physician-practice',
  name: 'Physician Practice',
  category: 'services',
  description: 'Physician Practice platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "physician practice",
      "physician",
      "practice",
      "physician software",
      "physician app",
      "physician platform",
      "physician system",
      "physician management",
      "services physician"
  ],

  synonyms: [
      "Physician Practice platform",
      "Physician Practice software",
      "Physician Practice system",
      "physician solution",
      "physician service"
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
      "Build a physician practice platform",
      "Create a physician practice app",
      "I need a physician practice management system",
      "Build a physician practice solution",
      "Create a physician practice booking system"
  ],
};
