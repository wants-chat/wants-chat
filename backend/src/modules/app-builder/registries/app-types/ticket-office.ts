/**
 * Ticket Office App Type Definition
 *
 * Complete definition for ticket office applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TICKET_OFFICE_APP_TYPE: AppTypeDefinition = {
  id: 'ticket-office',
  name: 'Ticket Office',
  category: 'services',
  description: 'Ticket Office platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "ticket office",
      "ticket",
      "office",
      "ticket software",
      "ticket app",
      "ticket platform",
      "ticket system",
      "ticket management",
      "services ticket"
  ],

  synonyms: [
      "Ticket Office platform",
      "Ticket Office software",
      "Ticket Office system",
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
      "Build a ticket office platform",
      "Create a ticket office app",
      "I need a ticket office management system",
      "Build a ticket office solution",
      "Create a ticket office booking system"
  ],
};
