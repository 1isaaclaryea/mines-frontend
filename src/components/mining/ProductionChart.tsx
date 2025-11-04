import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ProductionData {
  time: string;
  throughput: number;
  target: number;
  efficiency: number;
}

interface ProductionChartProps {
  data: ProductionData[];
  title: string;
  className?: string;
}

export function ProductionChart({
  data,
  title,
  className,
}: ProductionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === "efficiency" ? "%" : " tons/hr"}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                label={{
                  value: "Throughput (tons/hr)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                fontSize={12}
                label={{
                  value: "Efficiency (%)",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={100}
                stroke="#f59e0b"
                strokeDasharray="2 2"
                label={{ value: "Target", position: "left" }}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">
                Throughput
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">
                Efficiency
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-yellow-500"></div>
              <span className="text-muted-foreground">
                Target
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}