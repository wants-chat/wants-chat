/**
 * Aviation Insurance App Type Definition
 *
 * Complete definition for aviation insurance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AVIATION_INSURANCE_APP_TYPE: AppTypeDefinition = {
  id: 'aviation-insurance',
  name: 'Aviation Insurance',
  category: 'services',
  description: 'Aviation Insurance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "aviation insurance",
      "aviation",
      "insurance",
      "aviation software",
      "aviation app",
      "aviation platform",
      "aviation system",
      "aviation management",
      "services aviation"
  ],

  synonyms: [
      "Aviation Insurance platform",
      "Aviation Insurance software",
      "Aviation Insurance system",
      "aviation solution",
      "aviation service"
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
      "Build a aviation insurance platform",
      "Create a aviation insurance app",
      "I need a aviation insurance management system",
      "Build a aviation insurance solution",
      "Create a aviation insurance booking system"
  ],
};
