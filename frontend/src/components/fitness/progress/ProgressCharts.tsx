import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiChartLine,
  mdiScaleBalance,
  mdiCalendar
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Line, Bar } from 'react-chartjs-2';

interface ChartData {
  labels: string[];
  datasets: any[];
}

interface ProgressChartsProps {
  weightData: ChartData;
  bodyMeasurementsData: ChartData;
  workoutFrequencyData: ChartData;
  chartOptions: any;
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({
  weightData,
  bodyMeasurementsData,
  workoutFrequencyData,
  chartOptions
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weight Trend */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiChartLine} size={1} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
        </div>
        <div className="h-[300px]">
          <Line data={weightData} options={chartOptions} />
        </div>
      </Card>

      {/* Body Measurements */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Icon path={mdiScaleBalance} size={1} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Body Measurements</h3>
        </div>
        <div className="h-[300px]">
          <Bar data={bodyMeasurementsData} options={chartOptions} />
        </div>
      </Card>

      {/* Workout Frequency */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon path={mdiCalendar} size={1} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
        </div>
        <div className="h-[300px]">
          <Bar data={workoutFrequencyData} options={{
            ...chartOptions,
            scales: {
              x: {
                ticks: {
                  color: 'rgba(255, 255, 255, 0.6)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              },
              y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                  color: 'rgba(255, 255, 255, 0.6)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              }
            }
          }} />
        </div>
      </Card>
    </div>
  );
};

export default ProgressCharts;