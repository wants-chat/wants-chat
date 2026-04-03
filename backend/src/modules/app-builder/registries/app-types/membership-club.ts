/**
 * Membership Club App Type Definition
 *
 * Complete definition for membership club applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MEMBERSHIP_CLUB_APP_TYPE: AppTypeDefinition = {
  id: 'membership-club',
  name: 'Membership Club',
  category: 'logistics',
  description: 'Membership Club platform with comprehensive management features',
  icon: 'truck',

  keywords: [
      "membership club",
      "membership",
      "club",
      "membership software",
      "membership app",
      "membership platform",
      "membership system",
      "membership management",
      "logistics membership"
  ],

  synonyms: [
      "Membership Club platform",
      "Membership Club software",
      "Membership Club system",
      "membership solution",
      "membership service"
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
      "Build a membership club platform",
      "Create a membership club app",
      "I need a membership club management system",
      "Build a membership club solution",
      "Create a membership club booking system"
  ],
};
