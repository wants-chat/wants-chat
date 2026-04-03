/**
 * Nutrition Coaching App Type Definition
 *
 * Complete definition for nutrition coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NUTRITION_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'nutrition-coaching',
  name: 'Nutrition Coaching',
  category: 'professional-services',
  description: 'Nutrition Coaching platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "nutrition coaching",
      "nutrition",
      "coaching",
      "nutrition software",
      "nutrition app",
      "nutrition platform",
      "nutrition system",
      "nutrition management",
      "consulting nutrition"
  ],

  synonyms: [
      "Nutrition Coaching platform",
      "Nutrition Coaching software",
      "Nutrition Coaching system",
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
      "Build a nutrition coaching platform",
      "Create a nutrition coaching app",
      "I need a nutrition coaching management system",
      "Build a nutrition coaching solution",
      "Create a nutrition coaching booking system"
  ],
};
