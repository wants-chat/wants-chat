/**
 * Risk Management App Type Definition
 *
 * Complete definition for risk management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RISK_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'risk-management',
  name: 'Risk Management',
  category: 'services',
  description: 'Risk Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "risk management",
      "risk",
      "management",
      "risk software",
      "risk app",
      "risk platform",
      "risk system",
      "services risk"
  ],

  synonyms: [
      "Risk Management platform",
      "Risk Management software",
      "Risk Management system",
      "risk solution",
      "risk service"
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
      "Build a risk management platform",
      "Create a risk management app",
      "I need a risk management management system",
      "Build a risk management solution",
      "Create a risk management booking system"
  ],
};
