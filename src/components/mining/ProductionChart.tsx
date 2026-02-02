import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { chartDataOptions } from "./mockData";

type ChartOptionKey = keyof typeof chartDataOptions;

interface ProductionChartProps {
  className?: string;
}

export function ProductionChart({ className }: ProductionChartProps) {
  const [selectedChart, setSelectedChart] = useState<ChartOptionKey>("throughput");

  const currentOption = chartDataOptions[selectedChart];

  // Calculate Y-axis domain with upper bound above target for label visibility
  const targetValue = currentOption.data[0]?.target ?? 0;
  const allValues = currentOption.data.flatMap(d => [d.actual, d.target]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues, targetValue + 2);
  const yAxisDomain: [number, number] = [Math.floor(minValue * 0.95), Math.ceil(maxValue)];

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
              {`${entry.dataKey === 'actual' ? currentOption.actualLabel : currentOption.targetLabel}: ${entry.value} ${currentOption.unit}`}
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span>Performance Chart</span>
          </CardTitle>
          <Select
            value={selectedChart}
            onValueChange={(value: ChartOptionKey) => setSelectedChart(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select parameter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="throughput">Throughput vs Target</SelectItem>
              <SelectItem value="elution">Elution vs Target</SelectItem>
              <SelectItem value="goldRecovery">Gold Recovery vs Target</SelectItem>
              <SelectItem value="carbonInPulp">Carbon in Pulp vs Target</SelectItem>
              <SelectItem value="efficiency">Efficiency vs Target</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentOption.data}>
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
                domain={yAxisDomain}
                label={{
                  value: `${currentOption.actualLabel} (${currentOption.unit})`,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10, fill: "#9ca3af" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={currentOption.data[0]?.target}
                stroke={currentOption.targetColor}
                strokeDasharray="2 2"
                label={{ value: "Target", position: "left", fill: currentOption.targetColor }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke={currentOption.actualColor}
                strokeWidth={2}
                dot={{ fill: currentOption.actualColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={currentOption.actualLabel}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={currentOption.targetColor}
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name={currentOption.targetLabel}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentOption.actualColor }}
              ></div>
              <span className="text-muted-foreground">
                {currentOption.actualLabel}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-1"
                style={{ backgroundColor: currentOption.targetColor }}
              ></div>
              <span className="text-muted-foreground">
                {currentOption.targetLabel}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
