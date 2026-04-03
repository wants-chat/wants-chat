import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNDataVizAreaChart = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'stacked' = 'simple'
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
  const xAxisField = props.xAxisField || 'date';
  const yAxisFields = props.yAxisFields || ['value'];
  const colors = props.colors || ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];
  const title = resolved.title || 'Area Chart';

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
import Svg, { Line, Circle, Polygon, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface AreaChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

export default function AreaChart({
  ${dataName}: propData,
  className
}: AreaChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Transform raw data to chart series format
  const areaChartXAxisField = '${xAxisField}';
  const areaChartYAxisFields = ${JSON.stringify(yAxisFields)};
  const areaChartColors = ${JSON.stringify(colors)};

  const areaChartSeriesData: Series[] = areaChartYAxisFields.map((field: string, index: number) => ({
    name: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
    color: areaChartColors[index % areaChartColors.length],
    data: chartData.map((item: any) => ({
      label: item[areaChartXAxisField] ? new Date(item[areaChartXAxisField]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      value: Number(item[field]) || 0,
    })),
  }));

  // Calculate max value for scaling (inline to avoid variable renaming issues)
  const areaChartMaxValue = areaChartSeriesData.length > 0 && areaChartSeriesData[0].data.length > 0
    ? Math.max(...areaChartSeriesData.flatMap(s => s.data.map(d => d.value)), 1)
    : 100;
  const areaChartHeight = 250;
  const areaChartWidth = Dimensions.get('window').width - 80;
  const areaChartPadding = { top: 20, right: 20, bottom: 40, left: 50 };

  const scaleAreaChartY = (value: number) => {
    return areaChartHeight - areaChartPadding.bottom - ((value / areaChartMaxValue) * (areaChartHeight - areaChartPadding.top - areaChartPadding.bottom));
  };

  const scaleAreaChartX = (index: number, dataLength: number) => {
    if (dataLength <= 1) return areaChartPadding.left;
    const width = areaChartWidth - areaChartPadding.left - areaChartPadding.right;
    return areaChartPadding.left + (index * (width / (dataLength - 1)));
  };

  const renderAreaChart = () => {
    if (areaChartSeriesData.length === 0 || areaChartSeriesData[0].data.length === 0) {
      return null;
    }

    const areaChartDataLength = areaChartSeriesData[0].data.length;

    return (
      <Svg width={areaChartWidth} height={areaChartHeight} style={styles.svg}>
        <Defs>
          {areaChartSeriesData.map((s, index) => (
            <LinearGradient key={\`gradient-\${index}\`} id={\`gradient-\${index}\`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={s.color} stopOpacity="0.3" />
              <Stop offset="1" stopColor={s.color} stopOpacity="0.05" />
            </LinearGradient>
          ))}
        </Defs>

        {/* Grid lines */}
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yPos = scaleAreaChartY(areaChartMaxValue * ratio);
            return (
              <Line
                key={\`grid-\${i}\`}
                x1={areaChartPadding.left}
                y1={yPos}
                x2={areaChartWidth - areaChartPadding.right}
                y2={yPos}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
        </G>

        {/* Y-axis labels */}
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yValue = areaChartMaxValue * ratio;
            const yPos = scaleAreaChartY(yValue);
            return (
              <SvgText
                key={\`y-label-\${i}\`}
                x={areaChartPadding.left - 10}
                y={yPos + 4}
                fontSize="10"
                fill="#6b7280"
                textAnchor="end"
              >
                {yValue.toFixed(0)}
              </SvgText>
            );
          })}
        </G>

        {/* Area and line for each series */}
        {areaChartSeriesData.map((s, seriesIndex) => {
          // Build polygon points for filled area
          const topAreaPoints = s.data.map((d, i) =>
            \`\${scaleAreaChartX(i, areaChartDataLength)},\${scaleAreaChartY(d.value)}\`
          );
          const bottomLeft = \`\${scaleAreaChartX(0, areaChartDataLength)},\${areaChartHeight - areaChartPadding.bottom}\`;
          const bottomRight = \`\${scaleAreaChartX(areaChartDataLength - 1, areaChartDataLength)},\${areaChartHeight - areaChartPadding.bottom}\`;
          const filledAreaPoints = [...topAreaPoints, bottomRight, bottomLeft].join(' ');

          return (
            <G key={seriesIndex}>
              {/* Filled area */}
              <Polygon
                points={filledAreaPoints}
                fill={\`url(#gradient-\${seriesIndex})\`}
              />
              {/* Top line */}
              <Polygon
                points={topAreaPoints.join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
              />
              {/* Data points */}
              {s.data.map((d, pointIndex) => (
                <Circle
                  key={\`point-\${seriesIndex}-\${pointIndex}\`}
                  cx={scaleAreaChartX(pointIndex, areaChartDataLength)}
                  cy={scaleAreaChartY(d.value)}
                  r="4"
                  fill={s.color}
                />
              ))}
            </G>
          );
        })}

        {/* X-axis labels */}
        <G>
          {areaChartSeriesData[0].data.map((d, i) => {
            // Show every nth label to avoid crowding
            const showLabel = i % Math.max(1, Math.floor(areaChartDataLength / 6)) === 0;
            if (!showLabel) return null;

            return (
              <SvgText
                key={\`x-label-\${i}\`}
                x={scaleAreaChartX(i, areaChartDataLength)}
                y={areaChartHeight - areaChartPadding.bottom + 20}
                fontSize="10"
                fill="#6b7280"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
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
          <Text style={styles.title}>${title}</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>${title}</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (areaChartSeriesData.length === 0 || areaChartSeriesData[0].data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>${title}</Text>
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
        <Text style={styles.title}>${title}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderAreaChart()}
        </ScrollView>

        {/* Legend */}
        {areaChartSeriesData.length > 1 && (
          <View style={styles.legend}>
            {areaChartSeriesData.map((s, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: s.color }]} />
                <Text style={styles.legendLabel}>{s.name}</Text>
              </View>
            ))}
          </View>
        )}
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
  svg: {
    marginBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendLabel: {
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
    fileName: 'AreaChart.tsx',
    imports: []
  };
};
