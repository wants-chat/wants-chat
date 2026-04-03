/**
 * Lean Consulting App Type Definition
 *
 * Complete definition for lean consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEAN_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'lean-consulting',
  name: 'Lean Consulting',
  category: 'professional-services',
  description: 'Lean Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "lean consulting",
      "lean",
      "consulting",
      "lean software",
      "lean app",
      "lean platform",
      "lean system",
      "lean management",
      "consulting lean"
  ],

  synonyms: [
      "Lean Consulting platform",
      "Lean Consulting software",
      "Lean Consulting system",
      "lean solution",
      "lean service"
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
      "Build a lean consulting platform",
      "Create a lean consulting app",
      "I need a lean consulting management system",
      "Build a lean consulting solution",
      "Create a lean consulting booking system"
  ],
};
