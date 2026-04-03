/**
 * Transformation Consulting App Type Definition
 *
 * Complete definition for transformation consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRANSFORMATION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'transformation-consulting',
  name: 'Transformation Consulting',
  category: 'professional-services',
  description: 'Transformation Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "transformation consulting",
      "transformation",
      "consulting",
      "transformation software",
      "transformation app",
      "transformation platform",
      "transformation system",
      "transformation management",
      "consulting transformation"
  ],

  synonyms: [
      "Transformation Consulting platform",
      "Transformation Consulting software",
      "Transformation Consulting system",
      "transformation solution",
      "transformation service"
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
      "Build a transformation consulting platform",
      "Create a transformation consulting app",
      "I need a transformation consulting management system",
      "Build a transformation consulting solution",
      "Create a transformation consulting booking system"
  ],
};
