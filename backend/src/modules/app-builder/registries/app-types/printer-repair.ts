/**
 * Printer Repair App Type Definition
 *
 * Complete definition for printer repair applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PRINTER_REPAIR_APP_TYPE: AppTypeDefinition = {
  id: 'printer-repair',
  name: 'Printer Repair',
  category: 'services',
  description: 'Printer Repair platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "printer repair",
      "printer",
      "repair",
      "printer software",
      "printer app",
      "printer platform",
      "printer system",
      "printer management",
      "services printer"
  ],

  synonyms: [
      "Printer Repair platform",
      "Printer Repair software",
      "Printer Repair system",
      "printer solution",
      "printer service"
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a printer repair platform",
      "Create a printer repair app",
      "I need a printer repair management system",
      "Build a printer repair solution",
      "Create a printer repair booking system"
  ],
};
