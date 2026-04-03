/**
 * Leadership Coaching App Type Definition
 *
 * Complete definition for leadership coaching applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEADERSHIP_COACHING_APP_TYPE: AppTypeDefinition = {
  id: 'leadership-coaching',
  name: 'Leadership Coaching',
  category: 'logistics',
  description: 'Leadership Coaching platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "leadership coaching",
      "leadership",
      "coaching",
      "leadership software",
      "leadership app",
      "leadership platform",
      "leadership system",
      "leadership management",
      "logistics leadership"
  ],

  synonyms: [
      "Leadership Coaching platform",
      "Leadership Coaching software",
      "Leadership Coaching system",
      "leadership solution",
      "leadership service"
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
      "shipment-tracking",
      "route-optimization",
      "fleet-tracking",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "warehouse-mgmt",
      "freight-quotes",
      "carrier-integration",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'logistics',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
      "Build a leadership coaching platform",
      "Create a leadership coaching app",
      "I need a leadership coaching management system",
      "Build a leadership coaching solution",
      "Create a leadership coaching booking system"
  ],
};
