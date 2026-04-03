/**
 * Spa Services App Type Definition
 *
 * Complete definition for spa services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPA_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'spa-services',
  name: 'Spa Services',
  category: 'wellness',
  description: 'Spa Services platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "spa services",
      "spa",
      "services",
      "spa software",
      "spa app",
      "spa platform",
      "spa system",
      "spa management",
      "wellness spa"
  ],

  synonyms: [
      "Spa Services platform",
      "Spa Services software",
      "Spa Services system",
      "spa solution",
      "spa service"
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
      "Build a spa services platform",
      "Create a spa services app",
      "I need a spa services management system",
      "Build a spa services solution",
      "Create a spa services booking system"
  ],
};
