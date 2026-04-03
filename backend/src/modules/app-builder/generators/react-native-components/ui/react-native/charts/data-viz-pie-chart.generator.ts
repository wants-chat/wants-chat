import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNDataVizPieChart = (
  resolved: ResolvedComponent,
  variant: 'pie' | 'donut' | 'exploded' = 'donut'
) => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Extract props from resolved component
  const props = resolved.props || {};
  const labelField = props.labelField || 'label';
  const valueField = props.valueField || 'value';
  const title = resolved.title || 'Pie Chart';

  // Default colors for pie segments
  const defaultColors = [
    '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Get API route from serverFunction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource}`;
  };

  const apiRoute = getApiRoute();

  const code = `
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { apiClient } from '@/lib/api';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

interface DataSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  ${dataName}?: any[];
  title?: string;
  [key: string]: any;
}

export default function PieChart({
  ${dataName}: propData,
  title = '${title}'
}: PieChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pieChartColors = ${JSON.stringify(defaultColors)};

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (propData && propData.length > 0) {
        setChartData(propData);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('${apiRoute}');
        const data = Array.isArray(response) ? response : (response?.data || []);
        setChartData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Failed to load chart data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propData]);

  // Transform data to segments with percentages
  const pieChartSegments: DataSegment[] = React.useMemo(() => {
    const labelField = '${labelField}';
    const valueField = '${valueField}';

    const rawSegments = chartData.map((item: any, index: number) => ({
      label: String(item[labelField] || 'Unknown'),
      value: Number(item[valueField]) || 0,
      color: pieChartColors[index % pieChartColors.length],
    }));

    const total = rawSegments.reduce((sum, s) => sum + s.value, 0);

    return rawSegments.map(s => ({
      ...s,
      percentage: total > 0 ? (s.value / total) * 100 : 0,
    }));
  }, [chartData]);

  // SVG Donut Chart
  const renderDonutChart = () => {
    const chartSize = 200;
    const donutStrokeWidth = 40;
    const donutRadius = (chartSize - donutStrokeWidth) / 2;
    const chartCenter = chartSize / 2;
    const donutCircumference = 2 * Math.PI * donutRadius;

    let angleStart = -90; // Start from top

    return (
      <Svg width={chartSize} height={chartSize} style={styles.svg}>
        <G>
          {pieChartSegments.map((segment, index) => {
            const segmentAngle = (segment.percentage / 100) * 360;
            const angleEnd = angleStart + segmentAngle;

            // Calculate arc path
            const startX = chartCenter + donutRadius * Math.cos((angleStart * Math.PI) / 180);
            const startY = chartCenter + donutRadius * Math.sin((angleStart * Math.PI) / 180);
            const endX = chartCenter + donutRadius * Math.cos((angleEnd * Math.PI) / 180);
            const endY = chartCenter + donutRadius * Math.sin((angleEnd * Math.PI) / 180);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            angleStart = angleEnd;

            return (
              <Circle
                key={index}
                cx={chartCenter}
                cy={chartCenter}
                r={donutRadius}
                stroke={segment.color}
                strokeWidth={donutStrokeWidth}
                fill="none"
                strokeDasharray={\`\${(segment.percentage / 100) * donutCircumference} \${donutCircumference}\`}
                strokeDashoffset={-((angleStart - segmentAngle + 90) / 360) * donutCircumference}
                rotation={0}
              />
            );
          })}
        </G>
      </Svg>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (pieChartSegments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            {renderDonutChart()}
          </View>

          <ScrollView style={styles.legend}>
            {pieChartSegments.map((segment, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendLabel}>{segment.label}</Text>
                  <Text style={styles.legendValue}>
                    {segment.percentage.toFixed(1)}% · {segment.value.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  legend: {
    flex: 1,
    maxHeight: 250,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  legendValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    padding: 32,
  },
});`;

  return {
    code,
    fileName: 'PieChart.tsx',
    imports: []
  };
};
