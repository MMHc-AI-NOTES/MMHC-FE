import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, Rectangle, TooltipProps } from 'recharts';

interface WeeklyDataPoint {
  day: string;
  criticalFailures: number;
  hitl: number;
  passed: number;
  practitionerCorrections: number;
}

interface WeeklyVolumeChartProps {
  data: WeeklyDataPoint[];
}

const colorPalette = { criticalFailures: '#B91C1C', hitl: '#FDE047', passed: '#059669', practitionerCorrections: '#d97706' };
const getTopRadius = (entry: WeeklyDataPoint, key: keyof WeeklyDataPoint) => {
  const order: (keyof WeeklyDataPoint)[] = ['passed', 'practitionerCorrections', 'hitl', 'criticalFailures'];

  // Start from top-bar and go down
  for (let i = order.length - 1; i >= 0; i--) {
    const k = order[i];

    if (Number(entry[k]) > 0) {
      return k === key ? [4, 4, 0, 0] : [0, 0, 0, 0];
    }
  }

  return [0, 0, 0, 0];
};

const displayNames: Record<string, string> = {
  criticalFailures: 'Critical Failures',
  hitl: 'HITL',
  passed: 'Passed',
  practitionerCorrections: 'Practitioner Corrections',
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="mb-2 font-semibold text-gray-700">{payload[0].payload.day}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const name = displayNames[entry.dataKey as string] || entry.name || entry.dataKey;
            return (
              <div key={index} className="flex items-center gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: entry.color || colorPalette[entry.dataKey as keyof typeof colorPalette] }}
                  />
                  <span className="text-sm text-gray-600">{name}:</span>
                </div>
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

const WeeklyVolumeChart = ({ data }: WeeklyVolumeChartProps) => {
  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* X Axis - Days */}
            <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 600, fill: '#374151' }} />

            {/* Y Axis - Volume */}
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} ticks={[0, 50, 100, 150, 200]} />

            {/* Legend */}
            <Legend formatter={value => <span className="text-sm">{value}</span>} />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Stacked Bars */}
            <Bar
              dataKey="passed"
              stackId="a"
              fill={colorPalette.passed}
              name="Passed"
              shape={(props: any) => {
                const radius = getTopRadius(props.payload, 'passed');
                return <Rectangle {...props} radius={radius} />;
              }}
            />
            <Bar
              dataKey="practitionerCorrections"
              stackId="a"
              fill={colorPalette.practitionerCorrections}
              name="Practitioner Corrections"
              shape={(props: any) => {
                const radius = getTopRadius(props.payload, 'practitionerCorrections');
                return <Rectangle {...props} radius={radius} />;
              }}
            />

            <Bar
              dataKey="hitl"
              stackId="a"
              fill={colorPalette.hitl}
              name="HITL"
              shape={(props: any) => {
                const radius = getTopRadius(props.payload, 'hitl');
                return <Rectangle {...props} radius={radius} />;
              }}
            />

            <Bar
              dataKey="criticalFailures"
              stackId="a"
              fill={colorPalette.criticalFailures}
              name="Critical Failures"
              shape={(props: any) => {
                const radius = getTopRadius(props.payload, 'criticalFailures');
                return <Rectangle {...props} radius={radius} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 text-center text-sm text-gray-400">Daily Throughput Target: 500+ notes/day</div>
    </div>
  );
};

export default WeeklyVolumeChart;
