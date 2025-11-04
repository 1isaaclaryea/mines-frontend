import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  equipment: string;
  timestamp: string;
  prediction?: boolean;
  timeToFailure?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  className?: string;
}

export function AlertPanel({ alerts, className }: AlertPanelProps) {
  const getAlertIcon = (severity: string, prediction?: boolean) => {
    if (prediction) return <Clock className="h-4 w-4" />;
    
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <span>Active Alerts ({alerts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex items-start space-x-2 flex-1">
                    {getAlertIcon(alert.severity, alert.prediction)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.equipment}</p>
                        <Badge className={`${getSeverityBadge(alert.severity)} border text-xs`}>
                          {alert.prediction ? 'Prediction' : alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.timestamp}</span>
                        {alert.timeToFailure && (
                          <span className="text-yellow-400">ETA: {alert.timeToFailure}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}