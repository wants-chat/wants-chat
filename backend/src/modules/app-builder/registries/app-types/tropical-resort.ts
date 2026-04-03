/**
 * Tropical Resort App Type Definition
 *
 * Complete definition for tropical resort applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TROPICAL_RESORT_APP_TYPE: AppTypeDefinition = {
  id: 'tropical-resort',
  name: 'Tropical Resort',
  category: 'hospitality',
  description: 'Tropical Resort platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "tropical resort",
      "tropical",
      "resort",
      "tropical software",
      "tropical app",
      "tropical platform",
      "tropical system",
      "tropical management",
      "hospitality tropical"
  ],

  synonyms: [
      "Tropical Resort platform",
      "Tropical Resort software",
      "Tropical Resort system",
      "tropical solution",
      "tropical service"
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
      "room-booking",
      "housekeeping",
      "guest-services",
      "channel-manager",
      "notifications"
  ],

  optionalFeatures: [
      "rate-management",
      "payments",
      "reviews",
      "reporting",
      "analytics"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
      "Build a tropical resort platform",
      "Create a tropical resort app",
      "I need a tropical resort management system",
      "Build a tropical resort solution",
      "Create a tropical resort booking system"
  ],
};
