/**
 * Event Catering App Type Definition
 *
 * Complete definition for event catering applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_CATERING_APP_TYPE: AppTypeDefinition = {
  id: 'event-catering',
  name: 'Event Catering',
  category: 'hospitality',
  description: 'Event Catering platform with comprehensive management features',
  icon: 'plate',

  keywords: [
      "event catering",
      "event",
      "catering",
      "event software",
      "event app",
      "event platform",
      "event system",
      "event management",
      "food-beverage event"
  ],

  synonyms: [
      "Event Catering platform",
      "Event Catering software",
      "Event Catering system",
      "event solution",
      "event service"
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
          "name": "Owner",
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
          "name": "Customer",
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
      "menu-management",
      "calendar",
      "invoicing",
      "notifications"
  ],

  optionalFeatures: [
      "payments",
      "contracts",
      "clients",
      "reporting",
      "gallery"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'food-beverage',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a event catering platform",
      "Create a event catering app",
      "I need a event catering management system",
      "Build a event catering solution",
      "Create a event catering booking system"
  ],
};
