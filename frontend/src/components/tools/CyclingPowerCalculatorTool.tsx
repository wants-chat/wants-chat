import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bike, Gauge, Calculator, Mountain, TrendingUp, Info, Zap, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

type BikeType = 'road' | 'tt' | 'mountain' | 'gravel' | 'hybrid';
type UnitSystem = 'metric' | 'imperial';

interface PowerResult {
  powerWatts: number;
  wattsPerKg: number;
  equivalentFlatSpeed: number;
  caloriesPerHour: number;
  category: string;
  categoryColor: string;
}

interface FtpResult {
  ftp: number;
  wattsPerKg: number;
  category: string;
  categoryColor: string;
}

interface PowerZone {
  zone: number;
  name: string;
  description: string;
  minWatts: number;
  maxWatts: number;
  minPercent: number;
  maxPercent: number;
  color: string;
}

interface ClimbResult {
  timeMinutes: number;
  timeFormatted: string;
  averageSpeed: number;
  vatSeconds: number;
}

// Cycling category classifications based on W/kg
const getCyclingCategory = (wattsPerKg: number): { category: string; color: string } => {
  if (wattsPerKg >= 6.0) return { category: 'World Tour Pro', color: '#9333ea' };
  if (wattsPerKg >= 5.5) return { category: 'Pro Continental', color: '#dc2626' };
  if (wattsPerKg >= 5.0) return { category: 'Cat 1 / Elite', color: '#ea580c' };
  if (wattsPerKg >= 4.5) return { category: 'Cat 2', color: '#ca8a04' };
  if (wattsPerKg >= 4.0) return { category: 'Cat 3', color: '#16a34a' };
  if (wattsPerKg >= 3.5) return { category: 'Cat 4', color: '#0891b2' };
  if (wattsPerKg >= 3.0) return { category: 'Cat 5', color: '#2563eb' };
  if (wattsPerKg >= 2.5) return { category: 'Recreational', color: '#64748b' };
  return { category: 'Beginner', color: '#94a3b8' };
};

// Drag coefficients for different bike types
const getBikeDragCoefficient = (bikeType: BikeType): { cda: number; crr: number } => {
  switch (bikeType) {
    case 'tt': return { cda: 0.22, crr: 0.0025 };
    case 'road': return { cda: 0.32, crr: 0.003 };
    case 'gravel': return { cda: 0.35, crr: 0.004 };
    case 'mountain': return { cda: 0.40, crr: 0.012 };
    case 'hybrid': return { cda: 0.38, crr: 0.005 };
    default: return { cda: 0.32, crr: 0.003 };
  }
};

// Power zones based on FTP
const calculatePowerZones = (ftp: number): PowerZone[] => {
  return [
    { zone: 1, name: 'Active Recovery', description: 'Easy spinning', minPercent: 0, maxPercent: 55, minWatts: 0, maxWatts: Math.round(ftp * 0.55), color: '#94a3b8' },
    { zone: 2, name: 'Endurance', description: 'All day pace', minPercent: 56, maxPercent: 75, minWatts: Math.round(ftp * 0.56), maxWatts: Math.round(ftp * 0.75), color: '#3b82f6' },
    { zone: 3, name: 'Tempo', description: 'Brisk group ride', minPercent: 76, maxPercent: 90, minWatts: Math.round(ftp * 0.76), maxWatts: Math.round(ftp * 0.9), color: '#22c55e' },
    { zone: 4, name: 'Threshold', description: 'Time trial effort', minPercent: 91, maxPercent: 105, minWatts: Math.round(ftp * 0.91), maxWatts: Math.round(ftp * 1.05), color: '#eab308' },
    { zone: 5, name: 'VO2max', description: 'Hard intervals', minPercent: 106, maxPercent: 120, minWatts: Math.round(ftp * 1.06), maxWatts: Math.round(ftp * 1.2), color: '#f97316' },
    { zone: 6, name: 'Anaerobic', description: 'Short power', minPercent: 121, maxPercent: 150, minWatts: Math.round(ftp * 1.21), maxWatts: Math.round(ftp * 1.5), color: '#ef4444' },
    { zone: 7, name: 'Neuromuscular', description: 'Sprints', minPercent: 151, maxPercent: 200, minWatts: Math.round(ftp * 1.51), maxWatts: Math.round(ftp * 2.0), color: '#9333ea' },
  ];
};

// Famous climbs for reference
const famousClimbs = [
  { name: 'Alpe d\'Huez', distance: 13.8, elevation: 1071, gradient: 7.9 },
  { name: 'Mont Ventoux (Bedoin)', distance: 21.5, elevation: 1617, gradient: 7.5 },
  { name: 'Col du Tourmalet', distance: 17.1, elevation: 1268, gradient: 7.4 },
  { name: 'Stelvio (Prato)', distance: 24.3, elevation: 1808, gradient: 7.4 },
  { name: 'Col du Galibier', distance: 18.1, elevation: 1245, gradient: 6.9 },
  { name: 'Custom Climb', distance: 0, elevation: 0, gradient: 0 },
];

interface CyclingPowerCalculatorToolProps {
  uiConfig?: UIConfig;
}

// Column configurations for export
const POWER_COLUMNS: ColumnConfig[] = [
  { key: 'weight', header: 'Weight (kg)' },
  { key: 'speed', header: 'Speed (km/h)' },
  { key: 'gradient', header: 'Gradient (%)' },
  { key: 'windSpeed', header: 'Headwind (km/h)' },
  { key: 'bikeType', header: 'Bike Type' },
  { key: 'powerWatts', header: 'Power (W)', type: 'number' },
  { key: 'wattsPerKg', header: 'W/kg', type: 'number' },
  { key: 'equivalentFlatSpeed', header: 'Flat Speed Equiv. (km/h)', type: 'number' },
  { key: 'caloriesPerHour', header: 'Calories/Hour', type: 'number' },
  { key: 'category', header: 'Category' },
];

const FTP_COLUMNS: ColumnConfig[] = [
  { key: 'testType', header: 'Test Type' },
  { key: 'testPower', header: 'Test Power (W)', type: 'number' },
  { key: 'weight', header: 'Weight (kg)', type: 'number' },
  { key: 'ftp', header: 'Estimated FTP (W)', type: 'number' },
  { key: 'wattsPerKg', header: 'W/kg', type: 'number' },
  { key: 'category', header: 'Category' },
];

const ZONES_COLUMNS: ColumnConfig[] = [
  { key: 'zone', header: 'Zone', type: 'number' },
  { key: 'name', header: 'Zone Name' },
  { key: 'description', header: 'Description' },
  { key: 'minWatts', header: 'Min Watts', type: 'number' },
  { key: 'maxWatts', header: 'Max Watts', type: 'number' },
  { key: 'minPercent', header: 'Min %', type: 'number' },
  { key: 'maxPercent', header: 'Max %', type: 'number' },
];

const CLIMB_COLUMNS: ColumnConfig[] = [
  { key: 'climbName', header: 'Climb' },
  { key: 'distance', header: 'Distance (km)', type: 'number' },
  { key: 'elevation', header: 'Elevation (m)', type: 'number' },
  { key: 'weight', header: 'Weight (kg)', type: 'number' },
  { key: 'power', header: 'Power (W)', type: 'number' },
  { key: 'timeFormatted', header: 'Time' },
  { key: 'timeMinutes', header: 'Time (minutes)', type: 'number' },
  { key: 'averageSpeed', header: 'Avg Speed (km/h)', type: 'number' },
  { key: 'vam', header: 'VAM (m/hr)', type: 'number' },
];

export const CyclingPowerCalculatorTool: React.FC<CyclingPowerCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState('power');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Power Calculator State
  const [weight, setWeight] = useState('');
  const [speed, setSpeed] = useState('');
  const [gradient, setGradient] = useState('0');
  const [windSpeed, setWindSpeed] = useState('0');
  const [bikeType, setBikeType] = useState<BikeType>('road');
  const [powerResult, setPowerResult] = useState<PowerResult | null>(null);

  // FTP Estimator State
  const [testType, setTestType] = useState<'20min' | '8min' | '5min' | '1hour'>('20min');
  const [testPower, setTestPower] = useState('');
  const [ftpWeight, setFtpWeight] = useState('');
  const [ftpResult, setFtpResult] = useState<FtpResult | null>(null);

  // Power Zones State
  const [zoneFtp, setZoneFtp] = useState('');
  const [powerZones, setPowerZones] = useState<PowerZone[]>([]);

  // Climbing Time State
  const [climbWeight, setClimbWeight] = useState('');
  const [climbPower, setClimbPower] = useState('');
  const [selectedClimb, setSelectedClimb] = useState(0);
  const [customDistance, setCustomDistance] = useState('');
  const [customElevation, setCustomElevation] = useState('');
  const [climbResult, setClimbResult] = useState<ClimbResult | null>(null);

  const [showFormula, setShowFormula] = useState(false);

  // Export handlers
  const handleExportPowerCSV = () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    exportToCSV(data, POWER_COLUMNS, { filename: 'cycling-power-results' });
  };

  const handleExportPowerExcel = () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    exportToExcel(data, POWER_COLUMNS, { filename: 'cycling-power-results' });
  };

  const handleExportPowerJSON = () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    exportToJSON(data, { filename: 'cycling-power-results' });
  };

  const handleExportPowerPDF = async () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    await exportToPDF(data, POWER_COLUMNS, {
      filename: 'cycling-power-results',
      title: 'Cycling Power Calculator Results',
      subtitle: `Power Output Analysis - ${new Date().toLocaleDateString()}`,
    });
  };

  const handleExportPowerPrint = () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    printData(data, POWER_COLUMNS, { title: 'Cycling Power Results' });
  };

  const handleExportPowerCopy = async () => {
    if (!powerResult) return;
    const data = [{
      weight,
      speed,
      gradient,
      windSpeed,
      bikeType,
      ...powerResult,
    }];
    return copyUtil(data, POWER_COLUMNS, 'tab');
  };

  const handleExportFtpCSV = () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    exportToCSV(data, FTP_COLUMNS, { filename: 'ftp-estimation-results' });
  };

  const handleExportFtpExcel = () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    exportToExcel(data, FTP_COLUMNS, { filename: 'ftp-estimation-results' });
  };

  const handleExportFtpJSON = () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    exportToJSON(data, { filename: 'ftp-estimation-results' });
  };

  const handleExportFtpPDF = async () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    await exportToPDF(data, FTP_COLUMNS, {
      filename: 'ftp-estimation-results',
      title: 'FTP Estimation Results',
      subtitle: `Functional Threshold Power Analysis - ${new Date().toLocaleDateString()}`,
    });
  };

  const handleExportFtpPrint = () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    printData(data, FTP_COLUMNS, { title: 'FTP Estimation Results' });
  };

  const handleExportFtpCopy = async () => {
    if (!ftpResult) return;
    const data = [{
      testType,
      testPower,
      weight: ftpWeight,
      ...ftpResult,
    }];
    return copyUtil(data, FTP_COLUMNS, 'tab');
  };

  const handleExportZonesCSV = () => {
    if (powerZones.length === 0) return;
    exportToCSV(powerZones, ZONES_COLUMNS, { filename: 'power-zones' });
  };

  const handleExportZonesExcel = () => {
    if (powerZones.length === 0) return;
    exportToExcel(powerZones, ZONES_COLUMNS, { filename: 'power-zones' });
  };

  const handleExportZonesJSON = () => {
    if (powerZones.length === 0) return;
    exportToJSON(powerZones, { filename: 'power-zones' });
  };

  const handleExportZonesPDF = async () => {
    if (powerZones.length === 0) return;
    await exportToPDF(powerZones, ZONES_COLUMNS, {
      filename: 'power-zones',
      title: 'Power Training Zones',
      subtitle: `Training Zone Analysis - ${new Date().toLocaleDateString()}`,
    });
  };

  const handleExportZonesPrint = () => {
    if (powerZones.length === 0) return;
    printData(powerZones, ZONES_COLUMNS, { title: 'Power Training Zones' });
  };

  const handleExportZonesCopy = async () => {
    if (powerZones.length === 0) return;
    return copyUtil(powerZones, ZONES_COLUMNS, 'tab');
  };

  const handleExportClimbCSV = () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    exportToCSV(data, CLIMB_COLUMNS, { filename: 'climbing-time-results' });
  };

  const handleExportClimbExcel = () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    exportToExcel(data, CLIMB_COLUMNS, { filename: 'climbing-time-results' });
  };

  const handleExportClimbJSON = () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    exportToJSON(data, { filename: 'climbing-time-results' });
  };

  const handleExportClimbPDF = async () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    await exportToPDF(data, CLIMB_COLUMNS, {
      filename: 'climbing-time-results',
      title: 'Climbing Time Calculator Results',
      subtitle: `Climb Analysis: ${climbName} - ${new Date().toLocaleDateString()}`,
    });
  };

  const handleExportClimbPrint = () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    printData(data, CLIMB_COLUMNS, { title: 'Climbing Time Results' });
  };

  const handleExportClimbCopy = async () => {
    if (!climbResult) return;
    let climbName = famousClimbs[selectedClimb].name;
    const data = [{
      climbName,
      distance: famousClimbs[selectedClimb].distance,
      elevation: famousClimbs[selectedClimb].elevation,
      weight: climbWeight,
      power: climbPower,
      ...climbResult,
      vam: climbResult.vatSeconds,
    }];
    return copyUtil(data, CLIMB_COLUMNS, 'tab');
  };

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.weight !== undefined) {
        setWeight(String(params.weight));
        setIsPrefilled(true);
      }
      if (params.speed !== undefined) {
        setSpeed(String(params.speed));
        setIsPrefilled(true);
      }
      if (params.power !== undefined) {
        setTestPower(String(params.power));
        setZoneFtp(String(params.power));
        setClimbPower(String(params.power));
        setIsPrefilled(true);
      }
      if (params.bikeType) {
        setBikeType(params.bikeType as BikeType);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Calculate cycling power
  const calculatePower = () => {
    const weightKg = unitSystem === 'metric'
      ? parseFloat(weight)
      : parseFloat(weight) * 0.453592;

    const speedMs = unitSystem === 'metric'
      ? parseFloat(speed) / 3.6
      : parseFloat(speed) * 0.44704;

    const gradientPercent = parseFloat(gradient) / 100;
    const windMs = unitSystem === 'metric'
      ? parseFloat(windSpeed) / 3.6
      : parseFloat(windSpeed) * 0.44704;

    if (isNaN(weightKg) || isNaN(speedMs) || weightKg <= 0 || speedMs <= 0) {
      setValidationMessage('Please enter valid weight and speed values');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const bikeWeight = 8; // Average bike weight in kg
    const totalMass = weightKg + bikeWeight;
    const g = 9.81;
    const airDensity = 1.225; // kg/m³ at sea level

    const { cda, crr } = getBikeDragCoefficient(bikeType);

    // Effective wind speed (relative to cyclist)
    const effectiveSpeed = speedMs + windMs;

    // Power components
    const powerGravity = totalMass * g * gradientPercent * speedMs;
    const powerRolling = crr * totalMass * g * speedMs;
    const powerAero = 0.5 * airDensity * cda * Math.pow(effectiveSpeed, 2) * speedMs;
    const powerDrivetrain = 0.025; // 2.5% drivetrain loss factor

    const totalPower = (powerGravity + powerRolling + powerAero) / (1 - powerDrivetrain);
    const wattsPerKg = totalPower / weightKg;

    // Calculate equivalent flat speed (same power on flat)
    const flatCrr = 0.003;
    const flatCda = cda;
    // Iterative calculation for equivalent flat speed
    let flatSpeed = speedMs;
    for (let i = 0; i < 20; i++) {
      const flatPower = 0.5 * airDensity * flatCda * Math.pow(flatSpeed, 3) +
                        flatCrr * totalMass * g * flatSpeed;
      const diff = flatPower - totalPower;
      flatSpeed = flatSpeed - diff / (1.5 * airDensity * flatCda * Math.pow(flatSpeed, 2) +
                                       flatCrr * totalMass * g);
      if (Math.abs(diff) < 0.1) break;
    }

    // Calories burned (rough estimate: ~4.2 kJ per calorie, ~25% efficiency)
    const caloriesPerHour = (totalPower * 3600) / (4200 * 0.25);

    const { category, color } = getCyclingCategory(wattsPerKg);

    setPowerResult({
      powerWatts: Math.round(totalPower),
      wattsPerKg: parseFloat(wattsPerKg.toFixed(2)),
      equivalentFlatSpeed: unitSystem === 'metric'
        ? parseFloat((flatSpeed * 3.6).toFixed(1))
        : parseFloat((flatSpeed * 2.237).toFixed(1)),
      caloriesPerHour: Math.round(caloriesPerHour),
      category,
      categoryColor: color,
    });
  };

  // Estimate FTP from test results
  const estimateFtp = () => {
    const power = parseFloat(testPower);
    const weightKg = unitSystem === 'metric'
      ? parseFloat(ftpWeight)
      : parseFloat(ftpWeight) * 0.453592;

    if (isNaN(power) || isNaN(weightKg) || power <= 0 || weightKg <= 0) {
      setValidationMessage('Please enter valid power and weight values');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    let ftp: number;
    switch (testType) {
      case '20min':
        ftp = power * 0.95; // 95% of 20-minute power
        break;
      case '8min':
        ftp = power * 0.90; // 90% of 8-minute power
        break;
      case '5min':
        ftp = power * 0.85; // 85% of 5-minute power
        break;
      case '1hour':
        ftp = power; // 1-hour power is FTP by definition
        break;
      default:
        ftp = power * 0.95;
    }

    const wattsPerKg = ftp / weightKg;
    const { category, color } = getCyclingCategory(wattsPerKg);

    setFtpResult({
      ftp: Math.round(ftp),
      wattsPerKg: parseFloat(wattsPerKg.toFixed(2)),
      category,
      categoryColor: color,
    });
  };

  // Calculate power zones
  const calculateZones = () => {
    const ftp = parseFloat(zoneFtp);
    if (isNaN(ftp) || ftp <= 0) {
      setValidationMessage('Please enter a valid FTP value');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    setPowerZones(calculatePowerZones(ftp));
  };

  // Calculate climbing time
  const calculateClimbTime = () => {
    const weightKg = unitSystem === 'metric'
      ? parseFloat(climbWeight)
      : parseFloat(climbWeight) * 0.453592;
    const power = parseFloat(climbPower);

    let distance: number, elevation: number;
    if (selectedClimb === famousClimbs.length - 1) {
      distance = parseFloat(customDistance);
      elevation = parseFloat(customElevation);
    } else {
      distance = famousClimbs[selectedClimb].distance;
      elevation = famousClimbs[selectedClimb].elevation;
    }

    if (unitSystem === 'imperial') {
      distance = distance * 1.60934; // miles to km
      elevation = elevation * 0.3048; // feet to meters
    }

    if (isNaN(weightKg) || isNaN(power) || isNaN(distance) || isNaN(elevation) ||
        weightKg <= 0 || power <= 0 || distance <= 0 || elevation <= 0) {
      setValidationMessage('Please enter valid values');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const bikeWeight = 8;
    const totalMass = weightKg + bikeWeight;
    const g = 9.81;
    const airDensity = 1.225;
    const cda = 0.32;
    const crr = 0.004;

    // Calculate average gradient
    const avgGradient = elevation / (distance * 1000);

    // Estimate average speed iteratively
    let avgSpeed = 5; // Initial guess in m/s
    for (let i = 0; i < 50; i++) {
      const powerGravity = totalMass * g * avgGradient * avgSpeed;
      const powerRolling = crr * totalMass * g * avgSpeed;
      const powerAero = 0.5 * airDensity * cda * Math.pow(avgSpeed, 3);
      const totalPowerRequired = (powerGravity + powerRolling + powerAero) / 0.975;

      const diff = totalPowerRequired - power;
      if (Math.abs(diff) < 0.5) break;

      avgSpeed = avgSpeed * Math.pow(power / totalPowerRequired, 0.33);
    }

    const timeSeconds = (distance * 1000) / avgSpeed;
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.round(timeSeconds % 60);

    // VAM calculation (vertical ascent meters per hour)
    const vam = (elevation / timeSeconds) * 3600;

    setClimbResult({
      timeMinutes: parseFloat((timeSeconds / 60).toFixed(1)),
      timeFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      averageSpeed: unitSystem === 'metric'
        ? parseFloat((avgSpeed * 3.6).toFixed(1))
        : parseFloat((avgSpeed * 2.237).toFixed(1)),
      vatSeconds: Math.round(vam),
    });
  };

  const resetPower = () => {
    setWeight('');
    setSpeed('');
    setGradient('0');
    setWindSpeed('0');
    setBikeType('road');
    setPowerResult(null);
  };

  const resetFtp = () => {
    setTestPower('');
    setFtpWeight('');
    setFtpResult(null);
  };

  const resetZones = () => {
    setZoneFtp('');
    setPowerZones([]);
  };

  const resetClimb = () => {
    setClimbWeight('');
    setClimbPower('');
    setSelectedClimb(0);
    setCustomDistance('');
    setCustomElevation('');
    setClimbResult(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cyclingPowerCalculator.cyclingPowerCalculator', 'Cycling Power Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.cyclingPowerCalculator.estimatePowerOutputFtpAnd', 'Estimate power output, FTP, and training zones')}
              </p>
            </div>
          </div>

          {/* Unit System Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.cyclingPowerCalculator.metricKgKmH', 'Metric (kg, km/h)')}
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('tools.cyclingPowerCalculator.imperialLbsMph', 'Imperial (lbs, mph)')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="power" className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.cyclingPowerCalculator.power', 'Power')}</span>
              </TabsTrigger>
              <TabsTrigger value="ftp" className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.cyclingPowerCalculator.ftp', 'FTP')}</span>
              </TabsTrigger>
              <TabsTrigger value="zones" className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.cyclingPowerCalculator.zones', 'Zones')}</span>
              </TabsTrigger>
              <TabsTrigger value="climb" className="flex items-center gap-1">
                <Mountain className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tools.cyclingPowerCalculator.climb', 'Climb')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Power Calculator Tab */}
            <TabsContent value="power">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rider Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '70' : '154'}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Speed ({unitSystem === 'metric' ? t('tools.cyclingPowerCalculator.kmH', 'km/h') : 'mph'})
                    </label>
                    <input
                      type="number"
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '30' : '18.6'}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cyclingPowerCalculator.gradient', 'Gradient (%)')}
                    </label>
                    <input
                      type="number"
                      value={gradient}
                      onChange={(e) => setGradient(e.target.value)}
                      placeholder="0"
                      step="0.5"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Headwind ({unitSystem === 'metric' ? t('tools.cyclingPowerCalculator.kmH2', 'km/h') : 'mph'})
                    </label>
                    <input
                      type="number"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cyclingPowerCalculator.bikeType', 'Bike Type')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['road', 'tt', 'gravel', 'mountain', 'hybrid'] as BikeType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setBikeType(type)}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors capitalize ${
                          bikeType === type
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type === 'tt' ? 'TT' : type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={calculatePower}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    {t('tools.cyclingPowerCalculator.calculatePower', 'Calculate Power')}
                  </button>
                  <button
                    onClick={resetPower}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.cyclingPowerCalculator.reset', 'Reset')}
                  </button>
                </div>

                {powerResult && (
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.cyclingPowerCalculator.bg0d948810', 'bg-[#0D9488]/10')
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-center flex-1">
                        <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.estimatedPowerOutput', 'Estimated Power Output')}
                        </div>
                        <div className="text-5xl font-bold text-[#0D9488]">
                          {powerResult.powerWatts}W
                        </div>
                      </div>
                      <ExportDropdown
                        onExportCSV={handleExportPowerCSV}
                        onExportExcel={handleExportPowerExcel}
                        onExportJSON={handleExportPowerJSON}
                        onExportPDF={handleExportPowerPDF}
                        onPrint={handleExportPowerPrint}
                        onCopyToClipboard={handleExportPowerCopy}
                        disabled={!powerResult}
                        showImport={false}
                        theme={theme}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.wKg', 'W/kg')}
                        </div>
                        <div className="text-xl font-bold" style={{ color: powerResult.categoryColor }}>
                          {powerResult.wattsPerKg}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.flatSpeedEquiv', 'Flat Speed Equiv.')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {powerResult.equivalentFlatSpeed} {unitSystem === 'metric' ? t('tools.cyclingPowerCalculator.kmH3', 'km/h') : 'mph'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.calHour', 'Cal/hour')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                          {powerResult.caloriesPerHour}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.category', 'Category')}
                        </div>
                        <div className="text-sm font-bold" style={{ color: powerResult.categoryColor }}>
                          {powerResult.category}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* FTP Estimator Tab */}
            <TabsContent value="ftp">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cyclingPowerCalculator.testType', 'Test Type')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: '20min', label: '20 min' },
                      { value: '8min', label: '8 min' },
                      { value: '5min', label: '5 min' },
                      { value: '1hour', label: '1 hour' },
                    ].map((test) => (
                      <button
                        key={test.value}
                        onClick={() => setTestType(test.value as typeof testType)}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                          testType === test.value
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {test.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cyclingPowerCalculator.averagePowerWatts', 'Average Power (watts)')}
                    </label>
                    <input
                      type="number"
                      value={testPower}
                      onChange={(e) => setTestPower(e.target.value)}
                      placeholder="250"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Body Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      value={ftpWeight}
                      onChange={(e) => setFtpWeight(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '70' : '154'}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={estimateFtp}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {t('tools.cyclingPowerCalculator.estimateFtp', 'Estimate FTP')}
                  </button>
                  <button
                    onClick={resetFtp}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.cyclingPowerCalculator.reset2', 'Reset')}
                  </button>
                </div>

                {ftpResult && (
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.cyclingPowerCalculator.bg0d9488102', 'bg-[#0D9488]/10')
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-center flex-1">
                        <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.estimatedFtp', 'Estimated FTP')}
                        </div>
                        <div className="text-5xl font-bold text-[#0D9488]">
                          {ftpResult.ftp}W
                        </div>
                      </div>
                      <ExportDropdown
                        onExportCSV={handleExportFtpCSV}
                        onExportExcel={handleExportFtpExcel}
                        onExportJSON={handleExportFtpJSON}
                        onExportPDF={handleExportFtpPDF}
                        onPrint={handleExportFtpPrint}
                        onCopyToClipboard={handleExportFtpCopy}
                        disabled={!ftpResult}
                        showImport={false}
                        theme={theme}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.wKg2', 'W/kg')}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: ftpResult.categoryColor }}>
                          {ftpResult.wattsPerKg}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.category2', 'Category')}
                        </div>
                        <div className="text-lg font-bold" style={{ color: ftpResult.categoryColor }}>
                          {ftpResult.category}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.cyclingPowerCalculator.ftpEstimationFactors', 'FTP Estimation Factors')}
                  </h3>
                  <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex justify-between">
                      <span>20-minute test:</span>
                      <span className="font-medium">95% of avg power</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8-minute test:</span>
                      <span className="font-medium">90% of avg power</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5-minute test:</span>
                      <span className="font-medium">85% of avg power</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1-hour test:</span>
                      <span className="font-medium">100% (definition of FTP)</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Power Zones Tab */}
            <TabsContent value="zones">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cyclingPowerCalculator.yourFtpWatts', 'Your FTP (watts)')}
                  </label>
                  <input
                    type="number"
                    value={zoneFtp}
                    onChange={(e) => setZoneFtp(e.target.value)}
                    placeholder="200"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={calculateZones}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    {t('tools.cyclingPowerCalculator.calculateZones', 'Calculate Zones')}
                  </button>
                  <button
                    onClick={resetZones}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.cyclingPowerCalculator.reset3', 'Reset')}
                  </button>
                  {powerZones.length > 0 && (
                    <ExportDropdown
                      onExportCSV={handleExportZonesCSV}
                      onExportExcel={handleExportZonesExcel}
                      onExportJSON={handleExportZonesJSON}
                      onExportPDF={handleExportZonesPDF}
                      onPrint={handleExportZonesPrint}
                      onCopyToClipboard={handleExportZonesCopy}
                      disabled={powerZones.length === 0}
                      showImport={false}
                      theme={theme}
                    />
                  )}
                </div>

                {powerZones.length > 0 && (
                  <div className="space-y-3">
                    {powerZones.map((zone) => (
                      <div
                        key={zone.zone}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        style={{ borderLeft: `4px solid ${zone.color}` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: zone.color }}
                            >
                              {zone.zone}
                            </span>
                            <div>
                              <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {zone.name}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {zone.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {zone.minWatts} - {zone.maxWatts}W
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {zone.minPercent}% - {zone.maxPercent}% FTP
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: zone.color,
                              width: `${Math.min(100, (zone.maxPercent / 200) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Climbing Time Tab */}
            <TabsContent value="climb">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      value={climbWeight}
                      onChange={(e) => setClimbWeight(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '70' : '154'}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.cyclingPowerCalculator.powerWatts', 'Power (watts)')}
                    </label>
                    <input
                      type="number"
                      value={climbPower}
                      onChange={(e) => setClimbPower(e.target.value)}
                      placeholder="250"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('tools.cyclingPowerCalculator.selectClimb', 'Select Climb')}
                  </label>
                  <select
                    value={selectedClimb}
                    onChange={(e) => setSelectedClimb(parseInt(e.target.value))}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    {famousClimbs.map((climb, index) => (
                      <option key={index} value={index}>
                        {climb.name} {climb.distance > 0 ? `(${climb.distance}km, ${climb.gradient}%)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClimb === famousClimbs.length - 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Distance ({unitSystem === 'metric' ? 'km' : 'miles'})
                      </label>
                      <input
                        type="number"
                        value={customDistance}
                        onChange={(e) => setCustomDistance(e.target.value)}
                        placeholder="10"
                        step="0.1"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Elevation ({unitSystem === 'metric' ? 'm' : 'ft'})
                      </label>
                      <input
                        type="number"
                        value={customElevation}
                        onChange={(e) => setCustomElevation(e.target.value)}
                        placeholder="500"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={calculateClimbTime}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Mountain className="w-5 h-5" />
                    {t('tools.cyclingPowerCalculator.calculateTime', 'Calculate Time')}
                  </button>
                  <button
                    onClick={resetClimb}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.cyclingPowerCalculator.reset4', 'Reset')}
                  </button>
                </div>

                {climbResult && (
                  <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.cyclingPowerCalculator.bg0d9488103', 'bg-[#0D9488]/10')
                  }`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-center flex-1">
                        <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.estimatedClimbingTime', 'Estimated Climbing Time')}
                        </div>
                        <div className="text-5xl font-bold text-[#0D9488]">
                          {climbResult.timeFormatted}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({climbResult.timeMinutes} minutes)
                        </div>
                      </div>
                      <ExportDropdown
                        onExportCSV={handleExportClimbCSV}
                        onExportExcel={handleExportClimbExcel}
                        onExportJSON={handleExportClimbJSON}
                        onExportPDF={handleExportClimbPDF}
                        onPrint={handleExportClimbPrint}
                        onCopyToClipboard={handleExportClimbCopy}
                        disabled={!climbResult}
                        showImport={false}
                        theme={theme}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.avgSpeed', 'Avg Speed')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {climbResult.averageSpeed} {unitSystem === 'metric' ? t('tools.cyclingPowerCalculator.kmH4', 'km/h') : 'mph'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('tools.cyclingPowerCalculator.vamMHr', 'VAM (m/hr)')}
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                          {climbResult.vatSeconds}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* W/kg Categories Reference */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.cyclingPowerCalculator.cyclingPowerCategoriesWKg', 'Cycling Power Categories (W/kg at FTP)')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[
                { range: '6.0+', category: 'World Tour Pro', color: '#9333ea' },
                { range: '5.5-5.9', category: 'Pro Continental', color: '#dc2626' },
                { range: '5.0-5.4', category: 'Cat 1 / Elite', color: '#ea580c' },
                { range: '4.5-4.9', category: 'Cat 2', color: '#ca8a04' },
                { range: '4.0-4.4', category: 'Cat 3', color: '#16a34a' },
                { range: '3.5-3.9', category: 'Cat 4', color: '#0891b2' },
                { range: '3.0-3.4', category: 'Cat 5', color: '#2563eb' },
                { range: '2.5-2.9', category: 'Recreational', color: '#64748b' },
                { range: '< 2.5', category: 'Beginner', color: '#94a3b8' },
              ].map((item) => (
                <div key={item.category} className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.category}</span>
                  <span className="font-medium" style={{ color: item.color }}>{item.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Explanation */}
          <button
            onClick={() => setShowFormula(!showFormula)}
            className={`w-full mt-4 flex items-center justify-between p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Info className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.cyclingPowerCalculator.powerFormula', 'Power Formula')}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {showFormula ? '-' : '+'}
            </span>
          </button>

          {showFormula && (
            <div className={`mt-2 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold">Total Power = P_gravity + P_rolling + P_aero</p>
                <p className="font-mono text-xs">P_gravity = (rider + bike) x g x gradient x speed</p>
                <p className="font-mono text-xs">P_rolling = Crr x (rider + bike) x g x speed</p>
                <p className="font-mono text-xs">P_aero = 0.5 x air_density x CdA x speed^3</p>
                <p className="mt-3 text-xs">
                  Note: This calculator provides estimates. Actual power depends on many factors including
                  rider position, drafting, altitude, temperature, and equipment.
                </p>
              </div>
            </div>
          )}

          {validationMessage && (
            <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
              {validationMessage}
            </div>
          )}

          <ConfirmDialog />
        </div>
      </div>
    </div>
  );
};

export default CyclingPowerCalculatorTool;
