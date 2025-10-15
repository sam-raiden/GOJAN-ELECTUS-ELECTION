import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Candidate } from '../types';

interface ResultChartProps {
  candidates: Candidate[];
}

export const ResultChart = ({ candidates }: ResultChartProps) => {
  const data = candidates.map(c => ({
    name: c.name.split(' ')[0],
    votes: c.votes,
    fullName: c.name,
  }));

  const COLORS = ['#002868', '#BF0A30', '#0066CC'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-[#002868] mb-6">Vote Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-[#002868]">{payload[0].payload.fullName}</p>
                    <p className="text-gray-700">Votes: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
