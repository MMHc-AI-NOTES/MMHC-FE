import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PractitionerTrend } from '@/types/dashboard';

interface PractitionerTrendsChartProps {
  data: PractitionerTrend[];
}

const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const PractitionerTrendsChart = ({ data }: PractitionerTrendsChartProps) => {
  // Transform data for Recharts
  const chartData = data[0]?.data.map((dayData, index) => {
    const entry: any = { day: dayData.day };
    data.forEach(practitioner => {
      entry[practitioner.name] = practitioner.data[index].score;
    });
    return entry;
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[70, 100]} />
          <Tooltip />
          <Legend />
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
