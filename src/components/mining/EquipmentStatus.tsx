import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  Cog, 
  Zap, 
  Thermometer, 
  Activity,
  Settings,
  AlertTriangle
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: 'crusher' | 'conveyor' | 'separator' | 'pump' | 'generator';
  status: 'optimal' | 'caution' | 'critical' | 'offline';
  health: number;
  temperature: number;
  powerUsage: number;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface EquipmentStatusProps {
  equipment: Equipment[];
  onEquipmentClick?: (equipment: Equipment) => void;
}

export function EquipmentStatus({ equipment, onEquipmentClick }: EquipmentStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'caution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'crusher': return <Cog className="h-5 w-5" />;
      case 'conveyor': return <Activity className="h-5 w-5" />;
      case 'separator': return <Settings className="h-5 w-5" />;
      case 'pump': return <Zap className="h-5 w-5" />;
      case 'generator': return <Zap className="h-5 w-5" />;
      default: return <Cog className="h-5 w-5" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cog className="h-5 w-5 text-blue-400" />
          <span>Equipment Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() => onEquipmentClick?.(item)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getEquipmentIcon(item.type)}
                  <span className="font-medium">{item.name}</span>
                </div>
                <Badge className={`${getStatusColor(item.status)} border text-xs`}>
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Health</span>
                  <span className={getHealthColor(item.health)}>{item.health}%</span>
                </div>
                <Progress value={item.health} className="h-2" />
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="h-3 w-3 text-orange-400" />
                    <span className="text-muted-foreground">{item.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-blue-400" />
                    <span className="text-muted-foreground">{item.powerUsage}kW</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Efficiency: {item.efficiency}%
                </div>
                
                {item.status === 'critical' && (
                  <div className="flex items-center space-x-1 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Requires attention</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}