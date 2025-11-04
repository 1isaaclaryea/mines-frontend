import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  status: 'optimal' | 'caution' | 'critical';
  target?: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function KPICard({ title, value, unit, change, status, target, icon, onClick }: KPICardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'caution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  return (
    <Card 
      className={`bg-card border-border ${onClick ? 'cursor-pointer hover:border-muted-foreground/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">
                {value}
                {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
              </div>
            </div>
            {target && (
              <div className="text-sm text-muted-foreground">
                Target: {target}{unit}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={`${getStatusColor(status)} border`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {change !== undefined && (
              <div className="flex items-center space-x-1 text-sm">
                {getTrendIcon()}
                <span className={change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}