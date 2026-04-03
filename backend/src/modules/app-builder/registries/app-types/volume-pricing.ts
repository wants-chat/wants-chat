/**
 * Volume Pricing App Type Definition
 *
 * Complete definition for volume pricing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLUME_PRICING_APP_TYPE: AppTypeDefinition = {
  id: 'volume-pricing',
  name: 'Volume Pricing',
  category: 'services',
  description: 'Volume Pricing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "volume pricing",
      "volume",
      "pricing",
      "volume software",
      "volume app",
      "volume platform",
      "volume system",
      "volume management",
      "services volume"
  ],

  synonyms: [
      "Volume Pricing platform",
      "Volume Pricing software",
      "Volume Pricing system",
      "volume solution",
      "volume service"
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
      "Build a volume pricing platform",
      "Create a volume pricing app",
      "I need a volume pricing management system",
      "Build a volume pricing solution",
      "Create a volume pricing booking system"
  ],
};
