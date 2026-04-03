import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

/**
 * React Native Bar Chart Generator
 * Generates a bar chart component for data visualization
 * Supports horizontal and vertical orientations
 */
export const generateRNBarChart = (
  resolved: ResolvedComponent,
  variant: 'vertical' | 'horizontal' | 'standard' = 'standard'
) => {
  const dataSource = resolved.dataSource;

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
  const entityName = dataSource || 'items';

  const variants = {
    vertical: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface VerticalBarChartProps {
  ${dataName}?: any;
  entity?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  showValues?: boolean;
  showGrid?: boolean;
  [key: string]: any;
}

export default function VerticalBarChart({
  ${dataName}: propData,
  entity = '${entityName}',
  title,
  xAxisLabel,
  yAxisLabel,
  color = '#3b82f6',
  showValues = true,
  showGrid = true,
}: VerticalBarChartProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Extract and transform data
  const extractedData = sourceData?.${entityName} || sourceData?.items || sourceData?.data || sourceData;
  const rawData: any[] = Array.isArray(sourceData)
    ? sourceData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  // Transform raw data to chart format
  const chartData: BarChartData[] = rawData.map((item: any) => ({
    label: item.label || item.name || item.category?.name || item.category_name || item.x || 'Unknown',
    value: Number(item.value || item.amount || item.y || item.count || 0),
    color: item.color || item.category?.color || color,
  }));

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const chartHeight = 250;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {yAxisLabel && (
            <View style={styles.yAxisLabel}>
              <Text style={styles.axisLabelText}>{yAxisLabel}</Text>
            </View>
          )}

          <View style={styles.chart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {[4, 3, 2, 1, 0].map(i => {
                const value = (maxValue / 4) * i;
                return (
                  <Text key={i} style={styles.yAxisText}>
                    {value > 1000 ? \`\${(value / 1000).toFixed(1)}k\` : value.toFixed(0)}
                  </Text>
                );
              })}
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              {showGrid && (
                <View style={styles.gridContainer}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <View key={i} style={styles.gridLine} />
                  ))}
                </View>
              )}

              {/* Bars */}
              <View style={styles.barsContainer}>
                {chartData.map((item: any, index: number) => {
                  const barHeight = (item.value / maxValue) * chartHeight;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barContainer}>
                        {showValues && (
                          <Text style={styles.barValue}>
                            {item.value > 1000 ? \`\${(item.value / 1000).toFixed(1)}k\` : item.value.toFixed(0)}
                          </Text>
                        )}
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeight,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {xAxisLabel && (
            <View style={styles.xAxisLabel}>
              <Text style={styles.axisLabelText}>{xAxisLabel}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartContainer: {
    paddingVertical: 8,
  },
  yAxisLabel: {
    marginBottom: 8,
    paddingLeft: 40,
  },
  axisLabelText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    height: 250,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  chartArea: {
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: 250,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 250,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 250,
  },
  bar: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
    width: 60,
    textAlign: 'center',
  },
  xAxisLabel: {
    marginTop: 8,
    alignItems: 'center',
  },
});
`,
    horizontal: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  ${dataName}?: any;
  entity?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  showValues?: boolean;
  [key: string]: any;
}

export default function HorizontalBarChart({
  ${dataName}: propData,
  entity = '${entityName}',
  title,
  xAxisLabel,
  yAxisLabel,
  color = '#3b82f6',
  showValues = true,
}: HorizontalBarChartProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Extract and transform data
  const extractedData = sourceData?.${entityName} || sourceData?.items || sourceData?.data || sourceData;
  const rawData: any[] = Array.isArray(sourceData)
    ? sourceData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  // Transform raw data to chart format
  const chartData: BarChartData[] = rawData.map((item: any) => ({
    label: item.label || item.name || item.category?.name || item.category_name || item.x || 'Unknown',
    value: Number(item.value || item.amount || item.y || item.count || 0),
    color: item.color || item.category?.color || color,
  }));

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const barWidth = 200;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {chartData.map((item: any, index: number) => {
            const barLength = (item.value / maxValue) * barWidth;
            return (
              <View key={index} style={styles.barRow}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: barLength,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  {showValues && (
                    <Text style={styles.value}>
                      {item.value > 1000 ? \`\${(item.value / 1000).toFixed(1)}k\` : item.value.toFixed(0)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartContainer: {
    paddingVertical: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    width: 100,
    fontSize: 12,
    color: '#374151',
    marginRight: 12,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 28,
    borderRadius: 4,
    minWidth: 4,
  },
  value: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
});
`,
    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  ${dataName}?: any;
  entity?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  showGrid?: boolean;
  [key: string]: any;
}

export default function BarChart({
  ${dataName}: propData,
  entity = '${entityName}',
  title,
  xAxisLabel,
  yAxisLabel,
  color = '#3b82f6',
  orientation = 'vertical',
  showValues = true,
  showGrid = true,
}: BarChartProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Extract and transform data
  const extractedData = sourceData?.${entityName} || sourceData?.items || sourceData?.data || sourceData;
  const rawData: any[] = Array.isArray(sourceData)
    ? sourceData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  // Transform raw data to chart format
  const chartData: BarChartData[] = rawData.map((item: any) => ({
    label: item.label || item.name || item.category?.name || item.category_name || item.x || 'Unknown',
    value: Number(item.value || item.amount || item.y || item.count || 0),
    color: item.color || item.category?.color || color,
  }));

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // Render horizontal bar chart
  if (orientation === 'horizontal') {
    const barWidth = 200;

    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.chartContainer}>
            {chartData.map((item: any, index: number) => {
              const barLength = (item.value / maxValue) * barWidth;
              return (
                <View key={index} style={styles.barRow}>
                  <Text style={styles.label} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barHorizontal,
                        {
                          width: barLength,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                    {showValues && (
                      <Text style={styles.value}>
                        {item.value > 1000 ? \`\${(item.value / 1000).toFixed(1)}k\` : item.value.toFixed(0)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Render vertical bar chart
  const chartHeight = 250;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainerVertical}>
          <View style={styles.chart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {[4, 3, 2, 1, 0].map(i => {
                const value = (maxValue / 4) * i;
                return (
                  <Text key={i} style={styles.yAxisText}>
                    {value > 1000 ? \`\${(value / 1000).toFixed(1)}k\` : value.toFixed(0)}
                  </Text>
                );
              })}
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              {showGrid && (
                <View style={styles.gridContainer}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <View key={i} style={styles.gridLine} />
                  ))}
                </View>
              )}

              {/* Bars */}
              <View style={styles.barsContainer}>
                {chartData.map((item: any, index: number) => {
                  const barHeight = (item.value / maxValue) * chartHeight;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barContainerVertical}>
                        {showValues && (
                          <Text style={styles.barValue}>
                            {item.value > 1000 ? \`\${(item.value / 1000).toFixed(1)}k\` : item.value.toFixed(0)}
                          </Text>
                        )}
                        <View
                          style={[
                            styles.barVertical,
                            {
                              height: barHeight,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // Horizontal chart styles
  chartContainer: {
    paddingVertical: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    width: 100,
    fontSize: 12,
    color: '#374151',
    marginRight: 12,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barHorizontal: {
    height: 28,
    borderRadius: 4,
    minWidth: 4,
  },
  value: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  // Vertical chart styles
  chartContainerVertical: {
    paddingVertical: 8,
  },
  chart: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    height: 250,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  chartArea: {
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: 250,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 250,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  barContainerVertical: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 250,
  },
  barVertical: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
    width: 60,
    textAlign: 'center',
  },
});
`,
  };

  const selectedVariant = variants[variant] || variants.standard;

  return {
    code: selectedVariant.trim(),
    imports: [],
  };
};
