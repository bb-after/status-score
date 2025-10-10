import { Box, Text } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  data: Array<{ date: string; score: number; }>;
}

export function HistoricalChart({ data }: HistoricalChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      p={6}
    >
      <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={4}>
        Historical Reputation Trend
      </Text>
      
      <Box height="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value) => [`${value}/100`, 'Score']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#319795" 
              strokeWidth={3}
              dot={{ fill: '#319795', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}