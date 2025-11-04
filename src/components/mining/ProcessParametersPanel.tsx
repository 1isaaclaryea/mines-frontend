import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Wrench,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface Parameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'optimal' | 'caution' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  description: string;
}

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

const mockParameters: Parameter[] = [
  {
    id: 'cyanide-cil-1',
    name: 'Cyanide Level - CIL Tank 1',
    value: 2.8,
    unit: 'ppm',
    target: 3.0,
    status: 'caution',
    trend: 'down',
    lastUpdated: '2 mins ago',
    description: 'Sodium cyanide concentration in primary leaching circuit'
  },
  {
    id: 'do-cil-1',
    name: 'Dissolved Oxygen - CIL Tank 1',
    value: 8.2,
    unit: 'mg/L',
    target: 8.0,
    status: 'optimal',
    trend: 'stable',
    lastUpdated: '1 min ago',
    description: 'Oxygen saturation for optimal cyanidation process'
  },
  {
    id: 'ph-cil-2',
    name: 'pH Level - CIL Tank 2',
    value: 10.8,
    unit: '',
    target: 11.0,
    status: 'caution',
    trend: 'down',
    lastUpdated: '3 mins ago',
    description: 'Alkalinity level for cyanide stability'
  },
  {
    id: 'temperature-elution',
    name: 'Elution Strip Temperature',
    value: 98.5,
    unit: '°C',
    target: 100.0,
    status: 'optimal',
    trend: 'up',
    lastUpdated: '1 min ago',
    description: 'Temperature for carbon stripping process'
  },
  {
    id: 'pressure-oxygen',
    name: 'Oxygen Injection Pressure',
    value: 4.2,
    unit: 'bar',
    target: 4.5,
    status: 'caution',
    trend: 'down',
    lastUpdated: '2 mins ago',
    description: 'Pressure in oxygen distribution system'
  },
  {
    id: 'flow-rate-cil',
    name: 'CIL Circuit Flow Rate',
    value: 245,
    unit: 'L/min',
    target: 250,
    status: 'optimal',
    trend: 'stable',
    lastUpdated: '1 min ago',
    description: 'Slurry flow through carbon-in-leach circuit'
  },
  {
    id: 'carbon-loading',
    name: 'Carbon Loading',
    value: 3200,
    unit: 'g/t',
    target: 3500,
    status: 'caution',
    trend: 'up',
    lastUpdated: '4 mins ago',
    description: 'Gold loading on activated carbon'
  },
  {
    id: 'lime-consumption',
    name: 'Lime Consumption Rate',
    value: 1.8,
    unit: 'kg/t',
    target: 2.0,
    status: 'optimal',
    trend: 'stable',
    lastUpdated: '2 mins ago',
    description: 'Lime usage for pH control'
  }
];

// Generate mock historical data for trend visualization
const generateHistoricalData = (parameter: Parameter, hours: number = 24) => {
  const data = [];
  const now = new Date();
  const variance = parameter.target * 0.15; // 15% variance from target
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    
    // Create realistic variations around the target value
    const randomVariation = (Math.random() - 0.5) * variance;
    const trendEffect = parameter.trend === 'up' ? (hours - i) * 0.01 : 
                       parameter.trend === 'down' ? -(hours - i) * 0.01 : 0;
    const value = parameter.target + randomVariation + trendEffect;
    
    data.push({
      time: timeLabel,
      value: parseFloat(value.toFixed(2)),
      target: parameter.target,
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
};

const mockCriticalEquipment: Equipment[] = [
  {
    id: 'gravity-conc-1',
    name: 'Gravity Concentrator #1',
    type: 'separator',
    status: 'optimal',
    health: 94,
    temperature: 42,
    powerUsage: 87,
    efficiency: 96,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-02-15'
  },
  {
    id: 'cil-agitator-3',
    name: 'CIL Tank 3 Agitator',
    type: 'pump',
    status: 'caution',
    health: 78,
    temperature: 65,
    powerUsage: 112,
    efficiency: 82,
    lastMaintenance: '2024-01-08',
    nextMaintenance: '2024-02-08'
  },
  {
    id: 'oxygen-plant',
    name: 'Oxygen Generation Plant',
    type: 'generator',
    status: 'optimal',
    health: 91,
    temperature: 38,
    powerUsage: 156,
    efficiency: 93,
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-02-20'
  },
  {
    id: 'elution-column',
    name: 'Elution Column System',
    type: 'separator',
    status: 'critical',
    health: 65,
    temperature: 88,
    powerUsage: 95,
    efficiency: 71,
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05'
  },
  {
    id: 'carbon-screen',
    name: 'Carbon Screening System',
    type: 'separator',
    status: 'caution',
    health: 72,
    temperature: 45,
    powerUsage: 78,
    efficiency: 77,
    lastMaintenance: '2024-01-12',
    nextMaintenance: '2024-02-12'
  },
  {
    id: 'cyanide-dosing',
    name: 'Cyanide Dosing Pump',
    type: 'pump',
    status: 'optimal',
    health: 89,
    temperature: 41,
    powerUsage: 23,
    efficiency: 94,
    lastMaintenance: '2024-01-18',
    nextMaintenance: '2024-02-18'
  }
];

interface ProcessParametersPanelProps {
  section?: string;
  onBack?: () => void;
}

export function ProcessParametersPanel({ section, onBack }: ProcessParametersPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'caution' | 'optimal'>('all');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<'all' | 'critical' | 'caution' | 'optimal'>('all');
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleParameterClick = (parameter: Parameter) => {
    setSelectedParameter(parameter);
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'caution': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-400" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'border-l-green-500 bg-green-50/5';
      case 'caution': return 'border-l-yellow-500 bg-yellow-50/5';
      case 'critical': return 'border-l-red-500 bg-red-50/5';
      case 'offline': return 'border-l-gray-500 bg-gray-50/5';
      default: return 'border-l-blue-500 bg-blue-50/5';
    }
  };

  const getParameterIcon = (name: string) => {
    if (name.toLowerCase().includes('temperature')) return <Thermometer className="h-4 w-4" />;
    if (name.toLowerCase().includes('oxygen') || name.toLowerCase().includes('pressure')) return <Droplets className="h-4 w-4" />;
    if (name.toLowerCase().includes('ph') || name.toLowerCase().includes('cyanide')) return <Zap className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'separator': return <Filter className="h-4 w-4" />;
      case 'pump': return <Droplets className="h-4 w-4" />;
      case 'generator': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredParameters = selectedFilter === 'all' 
    ? mockParameters 
    : mockParameters.filter(param => param.status === selectedFilter);

  const filteredEquipment = selectedEquipmentFilter === 'all'
    ? mockCriticalEquipment
    : mockCriticalEquipment.filter(eq => eq.status === selectedEquipmentFilter);

  const parameterCounts = {
    total: mockParameters.length,
    critical: mockParameters.filter(p => p.status === 'critical').length,
    caution: mockParameters.filter(p => p.status === 'caution').length,
    optimal: mockParameters.filter(p => p.status === 'optimal').length
  };

  const equipmentCounts = {
    total: mockCriticalEquipment.length,
    critical: mockCriticalEquipment.filter(e => e.status === 'critical').length,
    caution: mockCriticalEquipment.filter(e => e.status === 'caution').length,
    optimal: mockCriticalEquipment.filter(e => e.status === 'optimal').length
  };

  const getSectionName = (sectionId?: string) => {
    const sectionNames: Record<string, string> = {
      'milling': 'Milling',
      'flotation': 'Flotation',
      'cil': 'CIL',
      'elution': 'Elution',
      'gravity-circuit': 'Gravity Circuit',
      'crusher': 'Crusher'
    };
    return sectionId ? sectionNames[sectionId] || 'All Sections' : 'All Sections';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                
              </Button>
            )}
            <h2 className="text-xl sm:text-2xl">
              {section ? `${getSectionName(section)} - ` : ''}Process Parameters
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Real-time monitoring of metallurgical process parameters and critical equipment
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Parameters</p>
                <p className="text-xl sm:text-2xl font-bold">{parameterCounts.total}</p>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-xl sm:text-2xl font-bold text-red-400">{parameterCounts.critical + equipmentCounts.critical}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Caution Items</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{parameterCounts.caution + equipmentCounts.caution}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Optimal Status</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{parameterCounts.optimal + equipmentCounts.optimal}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Process Parameters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Thermometer className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Process Parameters</span>
              </CardTitle>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(['all', 'critical', 'caution', 'optimal'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8 flex-shrink-0"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredParameters.map((parameter) => (
              <div
                key={parameter.id}
                className={`p-3 sm:p-4 rounded-lg border-l-4 ${getStatusColor(parameter.status)} cursor-pointer hover:bg-accent/50 transition-colors`}
                onClick={() => handleParameterClick(parameter)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2 flex-1 min-w-0">
                    {getParameterIcon(parameter.name)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base break-words">{parameter.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{parameter.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                    {getStatusIcon(parameter.status)}
                    {getTrendIcon(parameter.trend)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Current</p>
                    <p className="font-bold text-base sm:text-lg break-words">
                      {parameter.value}{parameter.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Updated</p>
                    <p className="text-xs sm:text-sm flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span className="break-words">{parameter.lastUpdated}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Equipment Status */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Critical Equipment</span>
              </CardTitle>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(['all', 'critical', 'caution', 'optimal'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedEquipmentFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEquipmentFilter(filter)}
                    className="capitalize text-xs sm:text-sm px-2 sm:px-3 py-1 h-7 sm:h-8 flex-shrink-0"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredEquipment.map((equipment) => {
              const isRunning = equipment.status !== 'offline';
              return (
                <div
                  key={equipment.id}
                  className={`p-3 sm:p-4 rounded-lg border-l-4 ${isRunning ? 'border-l-green-500 bg-green-50/5' : 'border-l-gray-500 bg-gray-50/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getEquipmentIcon(equipment.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base break-words">{equipment.name}</h4>
                        <Badge variant="outline" className="capitalize mt-1 text-xs">
                          {equipment.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {isRunning ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <Badge 
                        variant={isRunning ? 'default' : 'secondary'}
                        className="text-xs whitespace-nowrap"
                      >
                        {isRunning ? 'Running' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Parameter Trend Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="flex items-center space-x-2 text-sm sm:text-base">
              {selectedParameter && getParameterIcon(selectedParameter.name)}
              <span className="truncate">{selectedParameter?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedParameter?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedParameter && (
            <div className="space-y-3 mt-2">
              {/* Trend Chart - Made more prominent and wider than taller */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-2">24-Hour Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={generateHistoricalData(selectedParameter)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      label={{ 
                        value: selectedParameter.unit, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#3b82f6" 
                      strokeDasharray="5 5"
                      name="Target"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Actual Value"
                      dot={{ fill: '#10b981', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Current Stats - Made more compact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="text-base sm:text-lg font-bold">
                    {selectedParameter.value}{selectedParameter.unit}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Target Value</p>
                  <p className="text-base sm:text-lg font-bold text-blue-400">
                    {selectedParameter.target}{selectedParameter.unit}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="flex items-center space-x-1.5">
                    {getStatusIcon(selectedParameter.status)}
                    <span className="text-xs sm:text-sm font-semibold capitalize">
                      {selectedParameter.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Trend</p>
                  <div className="flex items-center space-x-1.5">
                    {getTrendIcon(selectedParameter.trend)}
                    <span className="text-xs sm:text-sm font-semibold capitalize">
                      {selectedParameter.trend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info - Made more compact */}
              <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{selectedParameter.lastUpdated}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}