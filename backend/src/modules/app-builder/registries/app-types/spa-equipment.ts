/**
 * Spa Equipment App Type Definition
 *
 * Complete definition for spa equipment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPA_EQUIPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'spa-equipment',
  name: 'Spa Equipment',
  category: 'wellness',
  description: 'Spa Equipment platform with comprehensive management features',
  icon: 'spa',

  keywords: [
      "spa equipment",
      "spa",
      "equipment",
      "spa software",
      "spa app",
      "spa platform",
      "spa system",
      "spa management",
      "wellness spa"
  ],

  synonyms: [
      "Spa Equipment platform",
      "Spa Equipment software",
      "Spa Equipment system",
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
      "Build a spa equipment platform",
      "Create a spa equipment app",
      "I need a spa equipment management system",
      "Build a spa equipment solution",
      "Create a spa equipment booking system"
  ],
};
