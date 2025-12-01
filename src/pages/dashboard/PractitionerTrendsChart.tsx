import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PractitionerTrend } from '@/types/dashboard';

interface PractitionerTrendsChartProps {
  data: PractitionerTrend[];
}

// Updated color palette with more colors for all practitioners
const colorPalette = ['#1E4129', '#A1E681', '#7DC75D'];

// Add HITL Variance data - you might want to pass this as a prop
const hitlVarianceData = [
  { day: 'Mon', variance: 85 },
  { day: 'Tue', variance: 87 },
  { day: 'Wed', variance: 89 },
  { day: 'Thu', variance: 88 },
  { day: 'Fri', variance: 91 },
  { day: 'Sat', variance: 90 },
  { day: 'Sun', variance: 87 },
];

const PractitionerTrendsChart = ({ data }: PractitionerTrendsChartProps) => {
  // Transform data for Recharts WITH HITL Variance
  const chartData = data[0]?.data.map((dayData, index) => {
    const entry: any = {
      day: dayData.day,
      // Add HITL Variance for this day
      'HITL Variance (%)': hitlVarianceData[index]?.variance || 85,
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
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[70, 100]} />
          <Tooltip />
          <Legend formatter={value => <span className="text-sm">{value}</span>} />

          {/* HITL Variance Line */}
          <Line
            type="monotone"
            dataKey="HITL Variance (%)"
            stroke="#EF6C00"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 0 }}
            activeDot={{ r: 0 }}
            name="HITL Variance (%)"
          />

          {data.map((practitioner, index) => (
            <Line
              key={practitioner.name}
              type="monotone"
              dataKey={practitioner.name}
              stroke={colorPalette[index % colorPalette.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PractitionerTrendsChart;
