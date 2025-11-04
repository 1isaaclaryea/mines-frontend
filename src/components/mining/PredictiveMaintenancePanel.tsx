import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Target,
  CheckCircle
} from "lucide-react";

interface PredictionData {
  id: string;
  equipment: string;
  type: string;
  probability: number;
  timeToFailure: string;
  confidence: number;
  impactLevel: string;
  recommendedAction: string;
}

interface PredictiveMaintenancePanelProps {
  predictions: PredictionData[];
  className?: string;
}

export function PredictiveMaintenancePanel({ predictions, className }: PredictiveMaintenancePanelProps) {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-red-400';
    if (probability >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-orange-400" />
          <span>Predictive Maintenance</span>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {predictions.length} Active Predictions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-4 rounded-lg border border-border bg-card/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-medium">{prediction.equipment}</h4>
                    <p className="text-sm text-muted-foreground">{prediction.type}</p>
                  </div>
                  <Badge className={`${getImpactColor(prediction.impactLevel)} border`}>
                    {prediction.impactLevel} Impact
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Failure Probability</span>
                      <span className={getProbabilityColor(prediction.probability)}>
                        {prediction.probability}%
                      </span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-blue-400">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">ETA: </span>
                      <span className="text-yellow-400">{prediction.timeToFailure}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Recommended Action: </span>
                      <span>{prediction.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Prediction updated 2 hours ago</span>
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