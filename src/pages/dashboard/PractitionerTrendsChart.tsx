import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { PractitionerTrend } from '@/types/dashboard';

interface PractitionerTrendsChartProps {
  data: PractitionerTrend[];
}

// Color mapping for practitioners - specific colors as per image
const practitionerColors: Record<string, string> = {
  'J. Thompson': '#1E4129',
  'L. Chen': '#2D5A3C',
  'R. Williams': '#059669',
  'A. Martinez': '#10B981',
};

// HITL Variance color
const HITL_VARIANCE_COLOR = '#D97706';

// Add HITL Variance data - scaled to 0-20 range for right Y-axis
const hitlVarianceData = [
  { day: 'Mon', variance: 15 },
  { day: 'Tue', variance: 17 },
  { day: 'Wed', variance: 19 },
  { day: 'Thu', variance: 18 },
  { day: 'Fri', variance: 20 },
  { day: 'Sat', variance: 19 },
  { day: 'Sun', variance: 17 },
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="mb-2 font-semibold text-gray-700">{payload[0].payload.day}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const name = entry.name || entry.dataKey || '';
            const color = name === 'HITL Variance (%)' ? HITL_VARIANCE_COLOR : entry.color || practitionerColors[name] || '#000';

            return (
              <div key={index} className="flex items-center gap-2">
                <div className="h-0.5 w-4" style={{ backgroundColor: color }} />

                <span className="text-sm text-gray-600">{name}:</span>
                <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const PractitionerTrendsChart = ({ data }: PractitionerTrendsChartProps) => {
  // Transform data for Recharts WITH HITL Variance
  const chartData = data[0]?.data.map((dayData, index) => {
    const entry: any = {
      day: dayData.day,
      // Add HITL Variance for this day (scaled to 0-20)
      'HITL Variance (%)': hitlVarianceData[index]?.variance || 15,
    };

    data.forEach(practitioner => {
      entry[practitioner.name] = practitioner.data[index].score;
    });

    return entry;
  });

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#374151' }} />
          {/* Left Y-axis for practitioners (70-100) */}
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} domain={[70, 100]} ticks={[70, 78, 86, 94, 100]} />
          {/* Right Y-axis for HITL Variance (0-20) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20, 25, 30]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={value => <span className="text-sm">{value}</span>} />

          {/* HITL Variance Line - uses right Y-axis */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="HITL Variance (%)"
            stroke={HITL_VARIANCE_COLOR}
            strokeWidth={4}
            strokeDasharray="5 5"
            dot={{ r: 8, strokeWidth: 2, stroke: HITL_VARIANCE_COLOR }}
            activeDot={{ r: 8, strokeWidth: 2, stroke: HITL_VARIANCE_COLOR }}
            name="HITL Variance (%)"
          />

          {/* Practitioner lines - uses left Y-axis */}
          {data.map(practitioner => {
            const color = practitionerColors[practitioner.name] || '#1E4129';
            return (
              <Line
                key={practitioner.name}
                yAxisId="left"
                type="monotone"
                dataKey={practitioner.name}
                stroke={color}
                strokeWidth={4}
                dot={{ r: 8, strokeWidth: 2, stroke: color }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: color }}
                name={practitioner.name}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PractitionerTrendsChart;
