/**
 * Nutrition Consulting App Type Definition
 *
 * Complete definition for nutrition consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NUTRITION_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'nutrition-consulting',
  name: 'Nutrition Consulting',
  category: 'professional-services',
  description: 'Nutrition Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "nutrition consulting",
      "nutrition",
      "consulting",
      "nutrition software",
      "nutrition app",
      "nutrition platform",
      "nutrition system",
      "nutrition management",
      "consulting nutrition"
  ],

  synonyms: [
      "Nutrition Consulting platform",
      "Nutrition Consulting software",
      "Nutrition Consulting system",
      "nutrition solution",
      "nutrition service"
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
      "Build a nutrition consulting platform",
      "Create a nutrition consulting app",
      "I need a nutrition consulting management system",
      "Build a nutrition consulting solution",
      "Create a nutrition consulting booking system"
  ],
};
