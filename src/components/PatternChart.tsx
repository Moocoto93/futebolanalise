import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PatternChartProps {
  data: Array<{ name: string; vitórias: number; empates: number; derrotas: number }>;
  title: string;
}

export const PatternChart = ({ data, title }: PatternChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Bar dataKey="vitórias" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="empates" fill="hsl(var(--muted-foreground))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="derrotas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
