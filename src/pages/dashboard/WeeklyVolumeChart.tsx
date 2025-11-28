import { WeeklyData } from '@/types/dashboard';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface WeeklyVolumeChartProps {
  data: WeeklyData[];
}

const WeeklyVolumeChart = ({ data }: WeeklyVolumeChartProps) => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="customGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f9fafb" /> {/* from-gray-50 */}
              <stop offset="100%" stopColor="var(--color-primary-light)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <Bar dataKey="volume" fill="url(#customGradient)" radius={[4, 4, 0, 0]} className="opacity-100 shadow-sm" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyVolumeChart;
