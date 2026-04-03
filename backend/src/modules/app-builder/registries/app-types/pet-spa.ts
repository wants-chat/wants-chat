/**
 * Pet Spa App Type Definition
 *
 * Complete definition for pet spa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PET_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'pet-spa',
  name: 'Pet Spa',
  category: 'wellness',
  description: 'Pet Spa platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "pet spa",
      "pet",
      "spa",
      "pet software",
      "pet app",
      "pet platform",
      "pet system",
      "pet management",
      "wellness pet"
  ],

  synonyms: [
      "Pet Spa platform",
      "Pet Spa software",
      "Pet Spa system",
      "pet solution",
      "pet service"
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
      "pos-system",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "membership-plans",
      "payments",
      "reviews",
      "gallery",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'wellness',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a pet spa platform",
      "Create a pet spa app",
      "I need a pet spa management system",
      "Build a pet spa solution",
      "Create a pet spa booking system"
  ],
};
