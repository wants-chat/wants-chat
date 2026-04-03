/**
 * Restaurant Consulting App Type Definition
 *
 * Complete definition for restaurant consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESTAURANT_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'restaurant-consulting',
  name: 'Restaurant Consulting',
  category: 'professional-services',
  description: 'Restaurant Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "restaurant consulting",
      "restaurant",
      "consulting",
      "restaurant software",
      "restaurant app",
      "restaurant platform",
      "restaurant system",
      "restaurant management",
      "consulting restaurant"
  ],

  synonyms: [
      "Restaurant Consulting platform",
      "Restaurant Consulting software",
      "Restaurant Consulting system",
      "restaurant solution",
      "restaurant service"
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
      "Build a restaurant consulting platform",
      "Create a restaurant consulting app",
      "I need a restaurant consulting management system",
      "Build a restaurant consulting solution",
      "Create a restaurant consulting booking system"
  ],
};
