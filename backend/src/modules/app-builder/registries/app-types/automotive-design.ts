/**
 * Automotive Design App Type Definition
 *
 * Complete definition for automotive design applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AUTOMOTIVE_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'automotive-design',
  name: 'Automotive Design',
  category: 'automotive',
  description: 'Automotive Design platform with comprehensive management features',
  icon: 'car',

  keywords: [
      "automotive design",
      "automotive",
      "design",
      "automotive software",
      "automotive app",
      "automotive platform",
      "automotive system",
      "automotive management",
      "automotive automotive"
  ],

  synonyms: [
      "Automotive Design platform",
      "Automotive Design software",
      "Automotive Design system",
      "automotive solution",
      "automotive service"
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
      "vehicle-inventory",
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "service-scheduling",
      "parts-catalog",
      "invoicing",
      "payments",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'automotive',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a automotive design platform",
      "Create a automotive design app",
      "I need a automotive design management system",
      "Build a automotive design solution",
      "Create a automotive design booking system"
  ],
};
