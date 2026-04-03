import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiWeight,
  mdiCamera
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Line } from 'react-chartjs-2';

interface WeightBodyTrackingProps {
  analyticsData?: any; // Body measurement analytics from API
  chartOptions: any;
  onAddPhoto?: () => void;
}

interface MeasurementRow {
  name: string;
  current: string;
  start: string;
  change: string;
  isPositive?: boolean;
}

const WeightBodyTracking: React.FC<WeightBodyTrackingProps> = ({
  analyticsData,
  chartOptions,
  onAddPhoto
}) => {
  // Transform API analytics data to chart format
  const transformToChartData = (measurementData: any) => {
    if (!measurementData || !measurementData.data) {
      return {
        labels: [],
        datasets: [{
          label: 'No data',
          data: [],
          borderColor: '#47bdff',
          backgroundColor: 'rgba(71, 189, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    return {
      labels: measurementData.data.map((point: any) => 
        new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        label: measurementData.type.replace('_', ' '),
        data: measurementData.data.map((point: any) => point.value),
        borderColor: measurementData.type === 'weight' ? '#47bdff' : '#10b981',
        backgroundColor: measurementData.type === 'weight' ? 'rgba(71, 189, 255, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const weightData = transformToChartData(analyticsData?.weight);
  const bodyFatData = transformToChartData(analyticsData?.bodyFat);
  
  // Generate measurements table from API data
  const generateMeasurementsTable = () => {
    if (!analyticsData) return [];
    
    const measurementTypes = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'calves'];
    
    return measurementTypes.map(type => {
      const data = analyticsData[type];
      if (!data || !data.data || data.data.length === 0) {
        return {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          current: '-- cm',
          start: '-- cm',
          change: '-- cm'
        };
      }
      
      const current = data.current || 0;
      const start = data.data[0]?.value || current;
      const change = current - start;
      
      return {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        current: `${current.toFixed(1)} cm`,
        start: `${start.toFixed(1)} cm`,
        change: change === 0 ? '0 cm' : `${change > 0 ? '+' : ''}${change.toFixed(1)} cm`,
        isPositive: change > 0
      };
    }).filter(Boolean);
  };
  
  const measurements = generateMeasurementsTable();

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiWeight} size={1} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Weight & Body Composition</h3>
        </div>
        {onAddPhoto && (
          <Button size="sm" onClick={onAddPhoto} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <Icon path={mdiCamera} size={0.7} className="mr-2" />
            Add Photo
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight History */}
        <div>
          <h4 className="font-medium mb-3 text-white">Weight History</h4>
          <div className="h-[300px]">
            <Line data={weightData} options={chartOptions} />
          </div>
        </div>

        {/* Body Fat Percentage */}
        <div>
          <h4 className="font-medium mb-3 text-white">Body Fat %</h4>
          <div className="h-[300px]">
            <Line data={bodyFatData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Measurements Table */}
      <div className="mt-6">
        <h4 className="font-medium mb-3 text-white">Body Measurements Tracking</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-3 text-sm font-medium text-white/60">Measurement</th>
                <th className="text-center p-3 text-sm font-medium text-white/60">Current</th>
                <th className="text-center p-3 text-sm font-medium text-white/60">Start</th>
                <th className="text-center p-3 text-sm font-medium text-white/60">Change</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((measurement, index) => (
                <tr key={index} className="border-b border-white/10 last:border-0">
                  <td className="p-3 font-medium text-white">{measurement.name}</td>
                  <td className="text-center p-3 text-white">{measurement.current}</td>
                  <td className="text-center p-3 text-white/60">{measurement.start}</td>
                  <td className={`text-center p-3 ${
                    measurement.isPositive ? 'text-emerald-500' : 'text-white/60'
                  }`}>
                    {measurement.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default WeightBodyTracking;