import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";
import { 
  TrendingUp, 
  Target, 
  Settings,
  Play,
  BarChart3
} from "lucide-react";
import { useState } from "react";

interface OptimizationData {
  parameter: string;
  current: number;
  optimal: number;
  impact: string;
  confidence: number;
}

interface OptimizationPanelProps {
  optimizations: OptimizationData[];
  className?: string;
}

export function OptimizationPanel({ optimizations, className }: OptimizationPanelProps) {
  const [adjustedValues, setAdjustedValues] = useState<Record<string, number>>({});

  const handleValueChange = (parameter: string, value: number[]) => {
    setAdjustedValues(prev => ({
      ...prev,
      [parameter]: value[0]
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactValue = (impact: string) => {
    const match = impact.match(/([+-]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getImpactColor = (impact: string) => {
    const value = getImpactValue(impact);
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <span>Process Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {optimizations.map((opt, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h4 className="font-medium">{opt.parameter}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current: {opt.current} → Optimal: {opt.optimal}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <span className={getImpactColor(opt.impact)}>{opt.impact}</span>
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Confidence: <span className={getConfidenceColor(opt.confidence)}>{opt.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Adjustment</span>
                    <span>
                      {adjustedValues[opt.parameter] ?? opt.current} 
                      {opt.parameter.includes('Speed') ? ' RPM' : 
                       opt.parameter.includes('Rate') ? ' tons/hr' : 
                       opt.parameter.includes('Pressure') ? ' bar' : ''}
                    </span>
                  </div>
                  <Slider
                    value={[adjustedValues[opt.parameter] ?? opt.current]}
                    onValueChange={(value) => handleValueChange(opt.parameter, value)}
                    max={Math.max(opt.current, opt.optimal) * 1.2}
                    min={Math.min(opt.current, opt.optimal) * 0.8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.min(opt.current, opt.optimal) * 0.8}</span>
                    <span className="text-green-400">Target: {opt.optimal}</span>
                    <span>{Math.max(opt.current, opt.optimal) * 1.2}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Implementation Confidence</span>
                    <span className={getConfidenceColor(opt.confidence)}>{opt.confidence}%</span>
                  </div>
                  <Progress value={opt.confidence} className="h-2" />
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Based on last 30 days of data</span>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-400">Optimization Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Implementing all recommended optimizations could result in:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <span className="text-green-400">+7.1% overall throughput increase</span></li>
                  <li>• <span className="text-green-400">+4.3% energy efficiency improvement</span></li>
                  <li>• <span className="text-blue-400">Estimated annual savings: $2.3M</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}