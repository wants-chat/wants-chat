/**
 * Risk Consulting App Type Definition
 *
 * Complete definition for risk consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RISK_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'risk-consulting',
  name: 'Risk Consulting',
  category: 'professional-services',
  description: 'Risk Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "risk consulting",
      "risk",
      "consulting",
      "risk software",
      "risk app",
      "risk platform",
      "risk system",
      "risk management",
      "consulting risk"
  ],

  synonyms: [
      "Risk Consulting platform",
      "Risk Consulting software",
      "Risk Consulting system",
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
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a risk consulting platform",
      "Create a risk consulting app",
      "I need a risk consulting management system",
      "Build a risk consulting solution",
      "Create a risk consulting booking system"
  ],
};
