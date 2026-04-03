/**
 * Chart Component Definition
 *
 * Data visualization chart component.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const CHART_COMPONENT: ComponentDefinition = {
  id: 'chart',
  name: 'Chart',
  category: 'data-display',
  description: 'Data visualization chart',
  icon: 'bar-chart-2',

  allowedIn: ['admin', 'vendor', 'frontend'],

  requiredFields: [
    {
      name: 'type',
      type: 'enum',
      label: 'Chart Type',
      options: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'],
      default: 'line',
    },
    {
      name: 'data',
      type: 'json',
      label: 'Chart Data',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'xAxisLabel',
      type: 'text',
      label: 'X-Axis Label',
    },
    {
      name: 'yAxisLabel',
      type: 'text',
      label: 'Y-Axis Label',
    },
    {
      name: 'showLegend',
      type: 'boolean',
      label: 'Show Legend',
      default: true,
    },
    {
      name: 'showGrid',
      type: 'boolean',
      label: 'Show Grid',
      default: true,
    },
    {
      name: 'height',
      type: 'number',
      label: 'Height (px)',
      default: 300,
    },
    {
      name: 'colors',
      type: 'json',
      label: 'Colors',
      default: [],
    },
    {
      name: 'loading',
      type: 'boolean',
      label: 'Loading State',
      default: false,
    },
  ],

  fieldSynonyms: {
    data: ['datasets', 'series', 'values'],
    type: ['chartType', 'variant'],
    colors: ['palette', 'colorScheme'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/analytics/:metric',
      purpose: 'read',
      responseFields: ['data', 'labels'],
    },
  ],

  events: [
    { name: 'onDataPointClick', description: 'Triggered when data point is clicked' },
    { name: 'onLegendClick', description: 'Triggered when legend item is clicked' },
  ],

  templatePath: 'templates/components/data-display/chart',
};
