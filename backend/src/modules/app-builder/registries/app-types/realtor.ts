/**
 * Realtor App Type Definition
 *
 * Complete definition for realtor applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const REALTOR_APP_TYPE: AppTypeDefinition = {
  id: 'realtor',
  name: 'Realtor',
  category: 'real-estate',
  description: 'Realtor platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "realtor",
      "realtor software",
      "realtor app",
      "realtor platform",
      "realtor system",
      "realtor management",
      "real-estate realtor"
  ],

  synonyms: [
      "Realtor platform",
      "Realtor software",
      "Realtor system",
      "realtor solution",
      "realtor service"
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
          "name": "Broker",
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
          "name": "Agent",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
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
      "property-listings",
      "showing-management",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "virtual-tours",
      "mls-integration",
      "property-valuation",
      "clients",
      "crm"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a realtor platform",
      "Create a realtor app",
      "I need a realtor management system",
      "Build a realtor solution",
      "Create a realtor booking system"
  ],
};
