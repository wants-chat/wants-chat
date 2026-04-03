/**
 * Apartment Management App Type Definition
 *
 * Complete definition for apartment management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APARTMENT_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'apartment-management',
  name: 'Apartment Management',
  category: 'real-estate',
  description: 'Apartment Management platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "apartment management",
      "apartment",
      "management",
      "apartment software",
      "apartment app",
      "apartment platform",
      "apartment system",
      "real-estate apartment"
  ],

  synonyms: [
      "Apartment Management platform",
      "Apartment Management software",
      "Apartment Management system",
      "apartment solution",
      "apartment service"
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
      "Build a apartment management platform",
      "Create a apartment management app",
      "I need a apartment management management system",
      "Build a apartment management solution",
      "Create a apartment management booking system"
  ],
};
