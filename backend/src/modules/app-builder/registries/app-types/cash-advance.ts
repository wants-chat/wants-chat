/**
 * Cash Advance App Type Definition
 *
 * Complete definition for cash advance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CASH_ADVANCE_APP_TYPE: AppTypeDefinition = {
  id: 'cash-advance',
  name: 'Cash Advance',
  category: 'services',
  description: 'Cash Advance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cash advance",
      "cash",
      "advance",
      "cash software",
      "cash app",
      "cash platform",
      "cash system",
      "cash management",
      "services cash"
  ],

  synonyms: [
      "Cash Advance platform",
      "Cash Advance software",
      "Cash Advance system",
      "cash solution",
      "cash service"
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
      "Build a cash advance platform",
      "Create a cash advance app",
      "I need a cash advance management system",
      "Build a cash advance solution",
      "Create a cash advance booking system"
  ],
};
