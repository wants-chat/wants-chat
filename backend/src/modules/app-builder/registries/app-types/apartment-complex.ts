/**
 * Apartment Complex App Type Definition
 *
 * Complete definition for apartment complex applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const APARTMENT_COMPLEX_APP_TYPE: AppTypeDefinition = {
  id: 'apartment-complex',
  name: 'Apartment Complex',
  category: 'real-estate',
  description: 'Apartment Complex platform with comprehensive management features',
  icon: 'home',

  keywords: [
      "apartment complex",
      "apartment",
      "complex",
      "apartment software",
      "apartment app",
      "apartment platform",
      "apartment system",
      "apartment management",
      "real-estate apartment"
  ],

  synonyms: [
      "Apartment Complex platform",
      "Apartment Complex software",
      "Apartment Complex system",
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
      "Build a apartment complex platform",
      "Create a apartment complex app",
      "I need a apartment complex management system",
      "Build a apartment complex solution",
      "Create a apartment complex booking system"
  ],
};
