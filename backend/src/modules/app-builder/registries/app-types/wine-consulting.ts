/**
 * Wine Consulting App Type Definition
 *
 * Complete definition for wine consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WINE_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'wine-consulting',
  name: 'Wine Consulting',
  category: 'professional-services',
  description: 'Wine Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "wine consulting",
      "wine",
      "consulting",
      "wine software",
      "wine app",
      "wine platform",
      "wine system",
      "wine management",
      "consulting wine"
  ],

  synonyms: [
      "Wine Consulting platform",
      "Wine Consulting software",
      "Wine Consulting system",
      "wine solution",
      "wine service"
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
      "Build a wine consulting platform",
      "Create a wine consulting app",
      "I need a wine consulting management system",
      "Build a wine consulting solution",
      "Create a wine consulting booking system"
  ],
};
