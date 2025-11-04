import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Cog, 
  Thermometer, 
  Zap, 
  Activity,
  Calendar,
  AlertTriangle,
  Wrench,
  BarChart3
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  health: number;
  temperature: number;
  powerUsage: number;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface EquipmentDetailPanelProps {
  equipment: Equipment;
  onClose: () => void;
  className?: string;
}

const mockSensorData = [
  { time: '00:00', temperature: 45, vibration: 2.1, power: 420 },
  { time: '04:00', temperature: 48, vibration: 2.3, power: 435 },
  { time: '08:00', temperature: 52, vibration: 2.5, power: 445 },
  { time: '12:00', temperature: 55, vibration: 2.8, power: 450 },
  { time: '16:00', temperature: 58, vibration: 3.1, power: 455 },
  { time: '20:00', temperature: 54, vibration: 2.9, power: 448 },
];

const mockPerformanceData = [
  { time: 'Week 1', efficiency: 92, throughput: 245, uptime: 98 },
  { time: 'Week 2', efficiency: 89, throughput: 238, uptime: 96 },
  { time: 'Week 3', efficiency: 85, throughput: 232, uptime: 94 },
  { time: 'Week 4', efficiency: 87, throughput: 241, uptime: 97 },
];

export function EquipmentDetailPanel({ equipment, onClose, className }: EquipmentDetailPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'caution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Cog className="h-5 w-5 text-blue-400" />
            <span>{equipment.name}</span>
            <Badge className={`${getStatusColor(equipment.status)} border`}>
              {equipment.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose} className="border-border">
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className={getHealthColor(equipment.health)}>{equipment.health}%</span>
                </div>
                <Progress value={equipment.health} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className="text-blue-400">{equipment.efficiency}%</span>
                </div>
                <Progress value={equipment.efficiency} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uptime (24h)</span>
                  <span className="text-green-400">97.2%</span>
                </div>
                <Progress value={97.2} className="h-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-muted-foreground">Temperature</span>
                </div>
                <div className="text-lg font-medium">{equipment.temperature}°C</div>
                <div className="text-xs text-muted-foreground">Max: 85°C</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Power Usage</span>
                </div>
                <div className="text-lg font-medium">{equipment.powerUsage}kW</div>
                <div className="text-xs text-muted-foreground">Avg: 425kW</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">Vibration</span>
                </div>
                <div className="text-lg font-medium">2.8mm/s</div>
                <div className="text-xs text-muted-foreground">Max: 5.0mm/s</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Load Factor</span>
                </div>
                <div className="text-lg font-medium">87%</div>
                <div className="text-xs text-muted-foreground">Optimal: 85-90%</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                  <Line type="monotone" dataKey="vibration" stroke="#10b981" strokeWidth={2} name="Vibration (mm/s)" />
                  <Line type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} name="Power (kW)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Efficiency %" />
                  <Area type="monotone" dataKey="uptime" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Uptime %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium">Maintenance Schedule</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Maintenance:</span>
                    <span>{equipment.lastMaintenance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Maintenance:</span>
                    <span className="text-yellow-400">{equipment.nextMaintenance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days Until Service:</span>
                    <span className="text-yellow-400">6 days</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Wrench className="h-5 w-5 text-orange-400" />
                  <h4 className="font-medium">Maintenance History</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-muted-foreground">Bearing replacement - Aug 15</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-muted-foreground">Oil change - Aug 10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-muted-foreground">Belt tension - Jul 28</span>
                  </div>
                </div>
              </div>
            </div>

            {equipment.status === 'critical' && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-400">Urgent Maintenance Required</h4>
                    <p className="text-sm text-muted-foreground">
                      Equipment health has dropped below critical threshold. Immediate inspection recommended.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}