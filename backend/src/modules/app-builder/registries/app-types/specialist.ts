/**
 * Specialist App Type Definition
 *
 * Complete definition for specialist applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALIST_APP_TYPE: AppTypeDefinition = {
  id: 'specialist',
  name: 'Specialist',
  category: 'services',
  description: 'Specialist platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "specialist",
      "specialist software",
      "specialist app",
      "specialist platform",
      "specialist system",
      "specialist management",
      "services specialist"
  ],

  synonyms: [
      "Specialist platform",
      "Specialist software",
      "Specialist system",
      "specialist solution",
      "specialist service"
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
      "Build a specialist platform",
      "Create a specialist app",
      "I need a specialist management system",
      "Build a specialist solution",
      "Create a specialist booking system"
  ],
};
