/**
 * Logistics Component Generators Index
 *
 * Exports all logistics/warehouse related component generators.
 */

// Shipment components
export {
  generateShipmentMap,
  generateShipmentFilters,
  generateShipmentTimeline,
  generateShipmentFiltersWarehouse,
  type ShipmentOptions,
} from './shipment.generator';

// Warehouse components
export {
  generateWarehouseStats,
  generateOrderListWarehouse,
  generateStockLevels,
  generateReceivingForm,
  generateReceivingList,
  type WarehouseOptions,
} from './warehouse.generator';

// Delivery components
export {
  generateDeliverySchedule,
  generateDeliveryTracker,
  generateRoutePlanner,
  generateTruckSchedule,
  type DeliveryOptions,
} from './delivery.generator';

// Picking components
export {
  generatePickList,
  generatePickQueue,
  type PickingOptions,
} from './picking.generator';

// Stats components
export {
  generateLogisticsStats,
  type LogisticsStatsOptions,
} from './stats.generator';
