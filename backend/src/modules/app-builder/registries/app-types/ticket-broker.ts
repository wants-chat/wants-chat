/**
 * Ticket Broker App Type Definition
 *
 * Complete definition for ticket broker applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TICKET_BROKER_APP_TYPE: AppTypeDefinition = {
  id: 'ticket-broker',
  name: 'Ticket Broker',
  category: 'services',
  description: 'Ticket Broker platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ticket broker",
      "ticket",
      "broker",
      "ticket software",
      "ticket app",
      "ticket platform",
      "ticket system",
      "ticket management",
      "services ticket"
  ],

  synonyms: [
      "Ticket Broker platform",
      "Ticket Broker software",
      "Ticket Broker system",
      "ticket solution",
      "ticket service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a ticket broker platform",
      "Create a ticket broker app",
      "I need a ticket broker management system",
      "Build a ticket broker solution",
      "Create a ticket broker booking system"
  ],
};
