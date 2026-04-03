/**
 * Health Spa App Type Definition
 *
 * Complete definition for health spa applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_SPA_APP_TYPE: AppTypeDefinition = {
  id: 'health-spa',
  name: 'Health Spa',
  category: 'wellness',
  description: 'Health Spa platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "health spa",
      "health",
      "spa",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "wellness health"
  ],

  synonyms: [
      "Health Spa platform",
      "Health Spa software",
      "Health Spa system",
      "health solution",
      "health service"
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
      "Build a health spa platform",
      "Create a health spa app",
      "I need a health spa management system",
      "Build a health spa solution",
      "Create a health spa booking system"
  ],
};
