import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRNDataVizLineChart = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'multiSeries' | 'area' = 'simple'
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
  const title = resolved.title || 'Line Chart';

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
import Svg, { Line, Circle, Polyline, G, Text as SvgText, Rect } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface LineChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

export default function LineChart({
  ${dataName}: propData,
  className
}: LineChartProps) {
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

  // Compute chart data using inline function to avoid variable renaming
  const getChartData = () => {
    return ${JSON.stringify(yAxisFields)}.map((field: string, index: number) => ({
      name: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
      color: ${JSON.stringify(colors)}[index % ${JSON.stringify(colors)}.length],
      data: chartData.map((item: any) => ({
        label: item['${xAxisField}'] ? new Date(item['${xAxisField}']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        value: Number(item[field]) || 0,
      })),
    }));
  };

  const renderLineChart = (renderData: any[]) => {
    if (renderData.length === 0 || renderData[0].data.length === 0) {
      return null;
    }

    return (
      <Svg width={Dimensions.get('window').width - 80} height={250} style={styles.svg}>
        {/* Grid lines */}
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <Line
              key={\`grid-\${i}\`}
              x1={50}
              y1={250 - 40 - ((ratio * Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) / Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) * (250 - 20 - 40)}
              x2={Dimensions.get('window').width - 80 - 20}
              y2={250 - 40 - ((ratio * Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) / Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) * (250 - 20 - 40)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
        </G>

        {/* Y-axis labels */}
        <G>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <SvgText
              key={\`y-label-\${i}\`}
              x={40}
              y={250 - 40 - ((ratio * Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) / Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) * (250 - 20 - 40) + 4}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {(ratio * Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)).toFixed(0)}
            </SvgText>
          ))}
        </G>

        {/* Lines and points for each series */}
        {renderData.map((s: any, seriesIndex: number) => (
          <G key={seriesIndex}>
            <Polyline
              points={s.data.map((d: any, i: number) =>
                \`\${50 + (i * ((Dimensions.get('window').width - 80 - 50 - 20) / (renderData[0].data.length - 1)))},\${250 - 40 - ((d.value / Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) * (250 - 20 - 40))}\`
              ).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
            />
            {s.data.map((d: any, pointIndex: number) => (
              <Circle
                key={\`point-\${seriesIndex}-\${pointIndex}\`}
                cx={50 + (pointIndex * ((Dimensions.get('window').width - 80 - 50 - 20) / (renderData[0].data.length - 1)))}
                cy={250 - 40 - ((d.value / Math.max(...renderData.flatMap((s: any) => s.data.map((d: any) => d.value)), 1)) * (250 - 20 - 40))}
                r="4"
                fill={s.color}
              />
            ))}
          </G>
        ))}

        {/* X-axis labels */}
        <G>
          {renderData[0].data.map((d: any, i: number) => {
            if (i % Math.max(1, Math.floor(renderData[0].data.length / 6)) !== 0) return null;
            return (
              <SvgText
                key={\`x-label-\${i}\`}
                x={50 + (i * ((Dimensions.get('window').width - 80 - 50 - 20) / (renderData[0].data.length - 1)))}
                y={230}
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

  const displaySeriesData = getChartData();

  if (displaySeriesData.length === 0 || displaySeriesData[0].data.length === 0) {
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
          {renderLineChart(displaySeriesData)}
        </ScrollView>

        {/* Legend */}
        {displaySeriesData.length > 1 && (
          <View style={styles.legend}>
            {displaySeriesData.map((s: any, index: number) => (
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
    fileName: 'LineChart.tsx',
    imports: []
  };
};
