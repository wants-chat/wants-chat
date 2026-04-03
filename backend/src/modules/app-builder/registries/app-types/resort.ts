/**
 * Resort App Type Definition
 *
 * Complete definition for resort applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESORT_APP_TYPE: AppTypeDefinition = {
  id: 'resort',
  name: 'Resort',
  category: 'hospitality',
  description: 'Resort platform with comprehensive management features',
  icon: 'hotel',

  keywords: [
      "resort",
      "resort software",
      "resort app",
      "resort platform",
      "resort system",
      "resort management",
      "hospitality resort"
  ],

  synonyms: [
      "Resort platform",
      "Resort software",
      "Resort system",
      "resort solution",
      "resort service"
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
      "Build a resort platform",
      "Create a resort app",
      "I need a resort management system",
      "Build a resort solution",
      "Create a resort booking system"
  ],
};
