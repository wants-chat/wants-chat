/**
 * Transportation Consulting App Type Definition
 *
 * Complete definition for transportation consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSPORTATION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'transportation-consulting',
  name: 'Transportation Consulting',
  category: 'professional-services',
  description: 'Transportation Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "transportation consulting",
      "transportation",
      "consulting",
      "transportation software",
      "transportation app",
      "transportation platform",
      "transportation system",
      "transportation management",
      "consulting transportation"
  ],

  synonyms: [
      "Transportation Consulting platform",
      "Transportation Consulting software",
      "Transportation Consulting system",
      "transportation solution",
      "transportation service"
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
      "Build a transportation consulting platform",
      "Create a transportation consulting app",
      "I need a transportation consulting management system",
      "Build a transportation consulting solution",
      "Create a transportation consulting booking system"
  ],
};
