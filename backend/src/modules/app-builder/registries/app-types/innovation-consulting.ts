/**
 * Innovation Consulting App Type Definition
 *
 * Complete definition for innovation consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INNOVATION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'innovation-consulting',
  name: 'Innovation Consulting',
  category: 'professional-services',
  description: 'Innovation Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "innovation consulting",
      "innovation",
      "consulting",
      "innovation software",
      "innovation app",
      "innovation platform",
      "innovation system",
      "innovation management",
      "consulting innovation"
  ],

  synonyms: [
      "Innovation Consulting platform",
      "Innovation Consulting software",
      "Innovation Consulting system",
      "innovation solution",
      "innovation service"
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a innovation consulting platform",
      "Create a innovation consulting app",
      "I need a innovation consulting management system",
      "Build a innovation consulting solution",
      "Create a innovation consulting booking system"
  ],
};
