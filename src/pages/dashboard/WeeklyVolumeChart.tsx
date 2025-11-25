import { WeeklyData } from '@/types/dashboard';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface WeeklyVolumeChartProps {
  data: WeeklyData[];
}

const WeeklyVolumeChart = ({ data }: WeeklyVolumeChartProps) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} className="opacity-80 transition-opacity hover:opacity-100" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyVolumeChart;
