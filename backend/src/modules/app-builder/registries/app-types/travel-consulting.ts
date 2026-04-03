/**
 * Travel Consulting App Type Definition
 *
 * Complete definition for travel consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'travel-consulting',
  name: 'Travel Consulting',
  category: 'professional-services',
  description: 'Travel Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "travel consulting",
      "travel",
      "consulting",
      "travel software",
      "travel app",
      "travel platform",
      "travel system",
      "travel management",
      "consulting travel"
  ],

  synonyms: [
      "Travel Consulting platform",
      "Travel Consulting software",
      "Travel Consulting system",
      "travel solution",
      "travel service"
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
      "Build a travel consulting platform",
      "Create a travel consulting app",
      "I need a travel consulting management system",
      "Build a travel consulting solution",
      "Create a travel consulting booking system"
  ],
};
