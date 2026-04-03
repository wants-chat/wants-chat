/**
 * Overnight Delivery App Type Definition
 *
 * Complete definition for overnight delivery applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OVERNIGHT_DELIVERY_APP_TYPE: AppTypeDefinition = {
  id: 'overnight-delivery',
  name: 'Overnight Delivery',
  category: 'logistics',
  description: 'Overnight Delivery platform with comprehensive management features',
  icon: 'delivery',

  keywords: [
      "overnight delivery",
      "overnight",
      "delivery",
      "overnight software",
      "overnight app",
      "overnight platform",
      "overnight system",
      "overnight management",
      "logistics overnight"
  ],

  synonyms: [
      "Overnight Delivery platform",
      "Overnight Delivery software",
      "Overnight Delivery system",
      "overnight solution",
      "overnight service"
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
      "orders",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "proof-of-delivery",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'logistics',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a overnight delivery platform",
      "Create a overnight delivery app",
      "I need a overnight delivery management system",
      "Build a overnight delivery solution",
      "Create a overnight delivery booking system"
  ],
};
