/**
 * Ayurvedic Spa App Type Definition
 *
 * Complete definition for ayurvedic spa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AYURVEDIC_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'ayurvedic-spa',
  name: 'Ayurvedic Spa',
  category: 'wellness',
  description: 'Ayurvedic Spa platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "ayurvedic spa",
      "ayurvedic",
      "spa",
      "ayurvedic software",
      "ayurvedic app",
      "ayurvedic platform",
      "ayurvedic system",
      "ayurvedic management",
      "wellness ayurvedic"
  ],

  synonyms: [
      "Ayurvedic Spa platform",
      "Ayurvedic Spa software",
      "Ayurvedic Spa system",
      "ayurvedic solution",
      "ayurvedic service"
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
      "Build a ayurvedic spa platform",
      "Create a ayurvedic spa app",
      "I need a ayurvedic spa management system",
      "Build a ayurvedic spa solution",
      "Create a ayurvedic spa booking system"
  ],
};
