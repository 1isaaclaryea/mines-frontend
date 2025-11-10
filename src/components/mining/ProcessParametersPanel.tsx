import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts';
import { 
  getAnalogHistorianData, 
  getDigitalHistorianData,
  isAuthenticated,
  getProcessParameterTargets,
  updateProcessParameterTargets,
  type HistorianDataPoint,
  type HistorianResponse,
  type DigitalHistorianResponse,
  type ProcessParameterTarget
} from '../../services/apiService';
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
  ArrowLeft,
  Edit,
  Save,
  X as XIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Parameter {
  id: string;
  name: string;
  tag: string;
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
  tag: string;
  type: 'crusher' | 'conveyor' | 'separator' | 'pump' | 'generator';
  status: 'optimal' | 'caution' | 'critical' | 'offline';
  health: number;
  temperature: number;
  powerUsage: number;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

// Section-specific parameter mappings
const SECTION_PARAMETERS: Record<string, Parameter[]> = {
  'cil': [
    {
      id: 'cn-level',
      name: 'Cyanide Level - CIL Tank 1',
      tag: 'FIX.CN_LEVEL.F_CV',
      value: 0,
      unit: 'ppm',
      target: 3.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Sodium cyanide concentration in primary leaching circuit'
    },
    {
      id: 'do-cil-1',
      name: 'Dissolved Oxygen - CIL Tank 1',
      tag: 'FIX.D0.F_CV',
      value: 0,
      unit: 'mg/L',
      target: 8.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Oxygen saturation for optimal cyanidation process'
    },
    {
      id: 'density',
      name: 'Density',
      tag: 'FIX.DENSITY.F_CV',
      value: 0,
      unit: 'g/cm³',
      target: 1.5,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Slurry density measurement'
    },
    {
      id: 'percentage-solids',
      name: 'Percentage solids',
      tag: 'FIX.PERCENTAGE_SOLIDS.F_CV',
      value: 0,
      unit: '%',
      target: 45.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Solid content in slurry'
    },
    {
      id: 'ph-level',
      name: 'pH Level',
      tag: 'FIX.PH_LEVEL.F_CV',
      value: 0,
      unit: '',
      target: 11.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Alkalinity level for cyanide stability'
    }
  ],
  'elution': [
    {
      id: 'elution-temperature',
      name: 'Temperature',
      tag: 'ELUTION.TEMPERATURE.F_CV',
      value: 0,
      unit: '°C',
      target: 100.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Elution strip temperature'
    },
    {
      id: 'elution-pressure',
      name: 'Pressure',
      tag: 'ELUTION.PRESSURE.F_CV',
      value: 0,
      unit: 'bar',
      target: 4.5,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Elution system pressure'
    }
  ],
  'flotation': [
    {
      id: 'flotation-density',
      name: 'Density',
      tag: 'FLOTATION.DENSITY.F_CV',
      value: 0,
      unit: 'g/cm³',
      target: 1.3,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Flotation slurry density'
    },
    {
      id: 'reagent-concentration',
      name: 'Reagent Concentration',
      tag: 'FLOTATION.REAGENT_CONC.F_CV',
      value: 0,
      unit: 'g/L',
      target: 50.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Flotation reagent concentration'
    }
  ],
  'gravity-circuit': [
    {
      id: 'gravity-amps',
      name: 'Amps',
      tag: 'GRAVITY.AMPS.F_CV',
      value: 0,
      unit: 'A',
      target: 150.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Gravity circuit amperage'
    }
  ],
  'milling': [
    {
      id: 'mill-throughput',
      name: 'Throughput',
      tag: 'MILLING.THROUGHPUT.F_CV',
      value: 0,
      unit: 't/h',
      target: 250.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Mill throughput rate'
    },
    {
      id: 'cyclone-pressure',
      name: 'Cyclone Pressure',
      tag: 'MILLING.CYCLONE_PRESSURE.F_CV',
      value: 0,
      unit: 'kPa',
      target: 120.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Cyclone feed pressure'
    },
    {
      id: 'mill-discharge-density',
      name: 'Mill Discharge Density',
      tag: 'MILLING.DISCHARGE_DENSITY.F_CV',
      value: 0,
      unit: 'g/cm³',
      target: 1.8,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Mill discharge slurry density'
    },
    {
      id: 'mill-weight',
      name: 'Mill Weight',
      tag: 'MILLING.MILL_WEIGHT.F_CV',
      value: 0,
      unit: 't',
      target: 180.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'SAG mill load weight'
    },
    {
      id: 'mill-power',
      name: 'Mill Power',
      tag: 'MILLING.MILL_POWER.F_CV',
      value: 0,
      unit: 'kW',
      target: 3500.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'SAG mill power draw'
    }
  ],
  'crusher': [
    {
      id: 'crusher-throughput',
      name: 'Throughput',
      tag: 'CRUSHER.THROUGHPUT.F_CV',
      value: 0,
      unit: 't/h',
      target: 300.0,
      status: 'optimal',
      trend: 'stable',
      lastUpdated: 'Loading...',
      description: 'Crusher throughput rate'
    }
  ]
};

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

// Section-specific equipment mappings
const SECTION_EQUIPMENT: Record<string, Equipment[]> = {
  'cil': [
    {
      id: 'cn-dosing-pump',
      name: 'Cyanide Dosing Pump',
      tag: 'FIX.CN_DOSING_PUMP.F_CV',
      type: 'pump',
      status: 'offline',
      health: 89,
      temperature: 41,
      powerUsage: 23,
      efficiency: 94,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18'
    },
    {
      id: 'oxygen-plant',
      name: 'Oxygen Generation Plant',
      tag: 'FIX.PSA3.F_CV',
      type: 'generator',
      status: 'offline',
      health: 91,
      temperature: 38,
      powerUsage: 156,
      efficiency: 93,
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-02-20'
    },
    {
      id: 'recovery-pump',
      name: 'Recovery Pump',
      tag: 'FIX.RECOVERY_PUMP.F_CV',
      type: 'pump',
      status: 'offline',
      health: 85,
      temperature: 50,
      powerUsage: 75,
      efficiency: 88,
      lastMaintenance: '2024-01-22',
      nextMaintenance: '2024-02-22'
    },
    {
      id: 'carbon-screen',
      name: 'Carbon Screening System',
      tag: 'FIX.RECOVERY_SCREEN.F_CV',
      type: 'separator',
      status: 'offline',
      health: 72,
      temperature: 45,
      powerUsage: 78,
      efficiency: 77,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12'
    },
    {
      id: 'cil-agitator-3',
      name: 'CIL Tank 3 Agitator',
      tag: 'FIX.TANK1_AGITATOR.F_CV',
      type: 'pump',
      status: 'offline',
      health: 78,
      temperature: 65,
      powerUsage: 112,
      efficiency: 82,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18'
    }
  ],
  'elution': [
    {
      id: 'thermomat',
      name: 'Thermomat',
      tag: 'ELUTION.THERMOMAT.F_CV',
      type: 'generator',
      status: 'offline',
      health: 88,
      temperature: 95,
      powerUsage: 120,
      efficiency: 91,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'recovery-screen',
      name: 'Recovery Screen',
      tag: 'ELUTION.RECOVERY_SCREEN.F_CV',
      type: 'separator',
      status: 'offline',
      health: 85,
      temperature: 42,
      powerUsage: 65,
      efficiency: 88,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15'
    },
    {
      id: 'strip-solution-pump',
      name: 'Strip Solution Pump',
      tag: 'ELUTION.STRIP_PUMP.F_CV',
      type: 'pump',
      status: 'offline',
      health: 90,
      temperature: 38,
      powerUsage: 45,
      efficiency: 93,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12'
    },
    {
      id: 'kiln',
      name: 'Kiln',
      tag: 'ELUTION.KILN.F_CV',
      type: 'generator',
      status: 'offline',
      health: 82,
      temperature: 850,
      powerUsage: 450,
      efficiency: 85,
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05'
    },
    {
      id: 'reagent-water-pump',
      name: 'Reagent Water Pump',
      tag: 'ELUTION.REAGENT_PUMP.F_CV',
      type: 'pump',
      status: 'offline',
      health: 91,
      temperature: 35,
      powerUsage: 30,
      efficiency: 94,
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-02-20'
    }
  ],
  'milling': [
    {
      id: 'discharge-pump-pp12',
      name: 'Discharge Pump PP12',
      tag: 'MILLING.PP12.F_CV',
      type: 'pump',
      status: 'offline',
      health: 87,
      temperature: 55,
      powerUsage: 85,
      efficiency: 89,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08'
    },
    {
      id: 'discharge-pump-pp14',
      name: 'Discharge Pump PP14',
      tag: 'MILLING.PP14.F_CV',
      type: 'pump',
      status: 'offline',
      health: 86,
      temperature: 56,
      powerUsage: 87,
      efficiency: 88,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08'
    },
    {
      id: 'discharge-screen-6',
      name: 'Discharge Screen 6',
      tag: 'MILLING.SCREEN_6.F_CV',
      type: 'separator',
      status: 'offline',
      health: 83,
      temperature: 48,
      powerUsage: 72,
      efficiency: 86,
      lastMaintenance: '2024-01-14',
      nextMaintenance: '2024-02-14'
    },
    {
      id: 'gravity-screen-33',
      name: 'Gravity Screen 33',
      tag: 'MILLING.GRAV_SCREEN_33.F_CV',
      type: 'separator',
      status: 'offline',
      health: 84,
      temperature: 45,
      powerUsage: 68,
      efficiency: 87,
      lastMaintenance: '2024-01-16',
      nextMaintenance: '2024-02-16'
    },
    {
      id: 'gravity-screen-34',
      name: 'Gravity Screen 34',
      tag: 'MILLING.GRAV_SCREEN_34.F_CV',
      type: 'separator',
      status: 'offline',
      health: 85,
      temperature: 44,
      powerUsage: 67,
      efficiency: 88,
      lastMaintenance: '2024-01-16',
      nextMaintenance: '2024-02-16'
    },
    {
      id: 'sag-mill',
      name: 'SAG Mill',
      tag: 'MILLING.SAG_MILL.F_CV',
      type: 'crusher',
      status: 'offline',
      health: 78,
      temperature: 75,
      powerUsage: 3500,
      efficiency: 82,
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-02-01'
    },
    {
      id: 'cv-015',
      name: 'CV-015',
      tag: 'MILLING.CV_015.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 90,
      temperature: 42,
      powerUsage: 55,
      efficiency: 92,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18'
    },
    {
      id: 'cv-022',
      name: 'CV-022',
      tag: 'MILLING.CV_022.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 89,
      temperature: 43,
      powerUsage: 56,
      efficiency: 91,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18'
    },
    {
      id: 'cv-023',
      name: 'CV-023',
      tag: 'MILLING.CV_023.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 88,
      temperature: 44,
      powerUsage: 57,
      efficiency: 90,
      lastMaintenance: '2024-01-18',
      nextMaintenance: '2024-02-18'
    },
    {
      id: 'raw-water-pump',
      name: 'Raw Water Pump',
      tag: 'MILLING.RAW_WATER_PUMP.F_CV',
      type: 'pump',
      status: 'offline',
      health: 92,
      temperature: 38,
      powerUsage: 75,
      efficiency: 94,
      lastMaintenance: '2024-01-22',
      nextMaintenance: '2024-02-22'
    }
  ],
  'gravity-circuit': [
    {
      id: 'knelson-1',
      name: 'Knelson 1',
      tag: 'GRAVITY.KNELSON_1.F_CV',
      type: 'separator',
      status: 'offline',
      health: 86,
      temperature: 48,
      powerUsage: 95,
      efficiency: 89,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12'
    },
    {
      id: 'knelson-2',
      name: 'Knelson 2',
      tag: 'GRAVITY.KNELSON_2.F_CV',
      type: 'separator',
      status: 'offline',
      health: 87,
      temperature: 47,
      powerUsage: 94,
      efficiency: 90,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-02-12'
    }
  ],
  'crusher': [
    {
      id: 'crusher',
      name: 'Crusher',
      tag: 'CRUSHER.MAIN.F_CV',
      type: 'crusher',
      status: 'offline',
      health: 80,
      temperature: 68,
      powerUsage: 850,
      efficiency: 83,
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-02-05'
    },
    {
      id: 'feeder-06',
      name: 'Feeder 06',
      tag: 'CRUSHER.FEEDER_06.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 88,
      temperature: 42,
      powerUsage: 45,
      efficiency: 91,
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15'
    },
    {
      id: 'cv-010',
      name: 'CV-010',
      tag: 'CRUSHER.CV_010.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 89,
      temperature: 41,
      powerUsage: 52,
      efficiency: 92,
      lastMaintenance: '2024-01-16',
      nextMaintenance: '2024-02-16'
    },
    {
      id: 'cv-501',
      name: 'CV-501',
      tag: 'CRUSHER.CV_501.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 90,
      temperature: 40,
      powerUsage: 50,
      efficiency: 93,
      lastMaintenance: '2024-01-16',
      nextMaintenance: '2024-02-16'
    },
    {
      id: 'oxide-apron-feeder',
      name: 'Oxide Apron Feeder',
      tag: 'CRUSHER.OXIDE_FEEDER.F_CV',
      type: 'conveyor',
      status: 'offline',
      health: 85,
      temperature: 44,
      powerUsage: 62,
      efficiency: 88,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    }
  ],
  'flotation': [
    {
      id: 'flotation-cell-1',
      name: 'Flotation Cell Motor 1',
      tag: 'FLOTATION.CELL_1.F_CV',
      type: 'pump',
      status: 'offline',
      health: 87,
      temperature: 52,
      powerUsage: 125,
      efficiency: 89,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-2',
      name: 'Flotation Cell Motor 2',
      tag: 'FLOTATION.CELL_2.F_CV',
      type: 'pump',
      status: 'offline',
      health: 88,
      temperature: 51,
      powerUsage: 123,
      efficiency: 90,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-3',
      name: 'Flotation Cell Motor 3',
      tag: 'FLOTATION.CELL_3.F_CV',
      type: 'pump',
      status: 'offline',
      health: 86,
      temperature: 53,
      powerUsage: 126,
      efficiency: 88,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-4',
      name: 'Flotation Cell Motor 4',
      tag: 'FLOTATION.CELL_4.F_CV',
      type: 'pump',
      status: 'offline',
      health: 87,
      temperature: 52,
      powerUsage: 124,
      efficiency: 89,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-5',
      name: 'Flotation Cell Motor 5',
      tag: 'FLOTATION.CELL_5.F_CV',
      type: 'pump',
      status: 'offline',
      health: 85,
      temperature: 54,
      powerUsage: 127,
      efficiency: 87,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-6',
      name: 'Flotation Cell Motor 6',
      tag: 'FLOTATION.CELL_6.F_CV',
      type: 'pump',
      status: 'offline',
      health: 88,
      temperature: 51,
      powerUsage: 122,
      efficiency: 90,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-cell-7',
      name: 'Flotation Cell Motor 7',
      tag: 'FLOTATION.CELL_7.F_CV',
      type: 'pump',
      status: 'offline',
      health: 86,
      temperature: 53,
      powerUsage: 125,
      efficiency: 88,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10'
    },
    {
      id: 'flotation-tailings-motor',
      name: 'Flotation Tailings Motor',
      tag: 'FLOTATION.TAILINGS_MOTOR.F_CV',
      type: 'pump',
      status: 'offline',
      health: 84,
      temperature: 55,
      powerUsage: 135,
      efficiency: 86,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08'
    }
  ]
};

interface ProcessParametersPanelProps {
  section?: string;
  onBack?: () => void;
}

export function ProcessParametersPanel({ section, onBack }: ProcessParametersPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'caution' | 'optimal'>('all');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<'all' | 'critical' | 'caution' | 'optimal'>('all');
  const [selectedParameter, setSelectedParameter] = useState<Parameter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [historianChartData, setHistorianChartData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  
  // Update Targets dialog state
  const [isUpdateTargetsOpen, setIsUpdateTargetsOpen] = useState(false);
  const [targetsData, setTargetsData] = useState<ProcessParameterTarget[]>([]);
  const [editedTargets, setEditedTargets] = useState<Record<string, number>>({});
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [currentTargetPage, setCurrentTargetPage] = useState(1);
  const targetsPerPage = 5;

  // Get section-specific parameters and equipment
  const sectionKey = section || 'cil'; // Default to CIL if no section specified
  const sectionParams = SECTION_PARAMETERS[sectionKey] || SECTION_PARAMETERS['cil'];
  const sectionEquipment = SECTION_EQUIPMENT[sectionKey] || SECTION_EQUIPMENT['cil'];
  
  const [parameters, setParameters] = useState<Parameter[]>(sectionParams);
  const [equipment, setEquipment] = useState<Equipment[]>(sectionEquipment);

  // Update parameters and equipment when section changes
  useEffect(() => {
    const newParams = SECTION_PARAMETERS[sectionKey] || SECTION_PARAMETERS['cil'];
    const newEquipment = SECTION_EQUIPMENT[sectionKey] || SECTION_EQUIPMENT['cil'];
    setParameters(newParams);
    setEquipment(newEquipment);
  }, [section, sectionKey]);

  // Fetch latest analog values for parameters (current values)
  useEffect(() => {
    const fetchParameterValues = async () => {
      const currentSectionParams = SECTION_PARAMETERS[sectionKey] || SECTION_PARAMETERS['cil'];
      if (!currentSectionParams || currentSectionParams.length === 0) return;
      
      // Check if user is authenticated before making API calls
      if (!isAuthenticated()) {
        console.warn('User not authenticated - skipping parameter values fetch');
        setParameters(currentSectionParams);
        return;
      }
      
      try {
        const tags = currentSectionParams.map((p: Parameter) => p.tag).join(',');
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // Last 5 minutes
        
        console.log('Fetching analog data for tags:', tags);
        const response = await getAnalogHistorianData(tags, startTime, endTime);
        console.log('Analog data response:', response);
        console.log('First data item sample:', response.data?.[0]);
        
        if (response.data && response.data.length > 0) {
          const updatedParams = currentSectionParams.map((param: Parameter) => {
            // Find latest value for this tag
            const tagData = response.data.filter(d => 
              (d.tag || d.tagName || d.tagname) === param.tag
            ).sort((a, b) => {
              const timeA = new Date(a.timestamp || a.time || 0).getTime();
              const timeB = new Date(b.timestamp || b.time || 0).getTime();
              return timeB - timeA;
            });
            
            console.log(`Tag ${param.tag} data:`, tagData);
            
            if (tagData.length > 0) {
              const latest = tagData[0];
              const value = latest.value;
              const target = param.target;
              const deviation = Math.abs(value - target) / target;
              
              let status: 'optimal' | 'caution' | 'critical';
              if (deviation < 0.1) status = 'optimal';
              else if (deviation < 0.2) status = 'caution';
              else status = 'critical';
              
              let trend: 'up' | 'down' | 'stable';
              if (value > target * 1.05) trend = 'up';
              else if (value < target * 0.95) trend = 'down';
              else trend = 'stable';
              
              const timestamp = new Date(latest.timestamp || latest.time || new Date());
              const formattedTime = timestamp.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return {
                ...param,
                value: parseFloat(value.toFixed(2)),
                status,
                trend,
                lastUpdated: formattedTime
              };
            }
            
            return param;
          });
          
          setParameters(updatedParams);
        } else {
          console.warn('No analog data received or empty data array');
          // Set parameters with default values to clear "Loading..." state
          setParameters(currentSectionParams);
        }
      } catch (error) {
        console.error('Error fetching parameter values:', error);
        // Set parameters with default values even on error
        setParameters(currentSectionParams);
      }
    };

    fetchParameterValues();
    const interval = setInterval(fetchParameterValues, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [sectionKey]);

  // Fetch digital values for equipment status
  useEffect(() => {
    const fetchEquipmentStatus = async () => {
      const currentSectionEquipment = SECTION_EQUIPMENT[sectionKey] || SECTION_EQUIPMENT['cil'];
      if (!currentSectionEquipment || currentSectionEquipment.length === 0) return;
      
      // Check if user is authenticated before making API calls
      if (!isAuthenticated()) {
        console.warn('User not authenticated - skipping equipment status fetch');
        setEquipment(currentSectionEquipment);
        return;
      }
      
      try {
        const updatedEquipment = await Promise.all(
          currentSectionEquipment.map(async (eq: Equipment) => {
            try {
              const response = await getDigitalHistorianData(eq.tag);
              
              if (response.success && response.value !== null) {
                const isRunning = response.value === 1;
                return {
                  ...eq,
                  status: isRunning ? 'optimal' as const : 'offline' as const
                };
              }
              
              return eq;
            } catch (error) {
              // Handle authentication errors gracefully
              if (error instanceof Error && error.message === 'Authentication required') {
                console.warn(`Authentication required for ${eq.tag} - using default status`);
              } else {
                console.error(`Error fetching status for ${eq.tag}:`, error);
              }
              return eq;
            }
          })
        );
        
        setEquipment(updatedEquipment);
      } catch (error) {
        console.error('Error fetching equipment status:', error);
      }
    };

    fetchEquipmentStatus();
    const interval = setInterval(fetchEquipmentStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [sectionKey]);

  // Fetch historian data for chart when parameter is selected
  useEffect(() => {
    if (!selectedParameter || !isDialogOpen) return;

    const fetchChartData = async () => {
      setIsLoadingChart(true);
      setChartError(null);
      
      // Check if user is authenticated before making API calls
      if (!isAuthenticated()) {
        console.warn('User not authenticated - using mock data for chart');
        setChartError('Please log in to view real-time data');
        setHistorianChartData(generateHistoricalData(selectedParameter));
        setIsLoadingChart(false);
        return;
      }
      
      try {
        // Get data from 00:00 today to current time
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const response = await getAnalogHistorianData(
          selectedParameter.tag,
          startOfDay,
          now
        );
        
        if (response.data && response.data.length > 0) {
          // Transform data for chart
          const chartData = response.data.map(point => {
            const timestamp = new Date(point.timestamp || point.time || new Date());
            return {
              time: timestamp.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              value: point.value,
              target: selectedParameter.target,
              timestamp: timestamp.getTime()
            };
          }).sort((a, b) => a.timestamp - b.timestamp);
          
          setHistorianChartData(chartData);
        } else {
          setHistorianChartData(generateHistoricalData(selectedParameter));
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        setChartError(errorMessage === 'Authentication required' 
          ? 'Please log in to view real-time data' 
          : errorMessage);
        setHistorianChartData(generateHistoricalData(selectedParameter));
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [selectedParameter, isDialogOpen]);

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
    ? parameters 
    : parameters.filter((param: Parameter) => param.status === selectedFilter);

  const filteredEquipment = selectedEquipmentFilter === 'all'
    ? equipment
    : equipment.filter((eq: Equipment) => eq.status === selectedEquipmentFilter);

  const parameterCounts = {
    total: parameters.length,
    critical: parameters.filter((p: Parameter) => p.status === 'critical').length,
    caution: parameters.filter((p: Parameter) => p.status === 'caution').length,
    optimal: parameters.filter((p: Parameter) => p.status === 'optimal').length
  };

  const equipmentCounts = {
    total: equipment.length,
    critical: equipment.filter((e: Equipment) => e.status === 'critical').length,
    caution: equipment.filter((e: Equipment) => e.status === 'caution').length,
    optimal: equipment.filter((e: Equipment) => e.status === 'optimal').length
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
        <div className="flex-1">
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
        <Button
          onClick={() => {
            setIsUpdateTargetsOpen(true);
            fetchTargets();
          }}
          className="ml-4"
        >
          <Edit className="h-4 w-4 mr-2" />
          Update Targets
        </Button>
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
                  className={`p-3 sm:p-4 rounded-lg border-l-4 ${isRunning ? 'border-l-green-500 bg-green-50/5' : 'border-l-red-500 bg-red-50/5'}`}
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
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <Badge 
                        variant={isRunning ? 'default' : 'destructive'}
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
              {/* Trend Chart with Live Data */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold">Today's Trend (00:00 - Now)</h3>
                  {historianChartData.length > 0 && !chartError && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                      Live Data
                    </Badge>
                  )}
                  {chartError && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500">
                      Mock Data
                    </Badge>
                  )}
                </div>
                
                {isLoadingChart && (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
                      <p className="text-sm">Loading historian data...</p>
                    </div>
                  </div>
                )}
                
                {chartError && !isLoadingChart && (
                  <div className="flex items-center justify-center h-[60px] text-muted-foreground">
                    <div className="text-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs">{chartError} - Showing mock data</p>
                    </div>
                  </div>
                )}
                
                {!isLoadingChart && (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={historianChartData.length > 0 ? historianChartData : generateHistoricalData(selectedParameter)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
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
                        dot={{ fill: '#10b981', r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                      <Brush 
                        dataKey="time" 
                        height={30} 
                        stroke="#8884d8"
                        fill="hsl(var(--muted))"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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

      {/* Update Targets Dialog */}
      <Dialog open={isUpdateTargetsOpen} onOpenChange={setIsUpdateTargetsOpen}>
        <DialogContent className="max-w-4xl h-[550px] p-3 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Update Process Parameter Targets</span>
            </DialogTitle>
            <DialogDescription>
              Edit target values for process parameters. Changes will be saved when you click Save.
            </DialogDescription>
          </DialogHeader>

          {isLoadingTargets ? (
            <div className="flex items-center justify-center py-8">
              <Activity className="h-8 w-8 animate-pulse" />
              <span className="ml-2">Loading targets...</span>
            </div>
          ) : targetsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No targets found</p>
            </div>
          ) : (
            <>
              <div className="flex-1 px-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-background border-b">
                      <TableRow>
                        <TableHead className="min-w-[250px]">Parameter Name</TableHead>
                        <TableHead className="w-[180px]">Target Value</TableHead>
                        <TableHead className="w-[150px]">Updated By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const totalPages = Math.ceil(targetsData.length / targetsPerPage);
                        const startIndex = (currentTargetPage - 1) * targetsPerPage;
                        const endIndex = startIndex + targetsPerPage;
                        const paginatedTargets = targetsData.slice(startIndex, endIndex);
                        
                        return paginatedTargets.map((target) => {
                          const currentValue = editedTargets[target.parameterId] ?? target.targetValue;
                          return (
                            <TableRow key={target.parameterId}>
                              <TableCell className="font-medium whitespace-normal">
                                {target.parameterName || target.parameterId}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={currentValue}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                      setEditedTargets(prev => ({
                                        ...prev,
                                        [target.parameterId]: value
                                      }));
                                    }
                                  }}
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground truncate">
                                {target.updatedBy || '-'}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {targetsData.length > targetsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentTargetPage - 1) * targetsPerPage) + 1} to {Math.min(currentTargetPage * targetsPerPage, targetsData.length)} of {targetsData.length} parameters
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTargetPage(prev => Math.max(1, prev - 1))}
                        disabled={currentTargetPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {currentTargetPage} of {Math.ceil(targetsData.length / targetsPerPage)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTargetPage(prev => Math.min(Math.ceil(targetsData.length / targetsPerPage), prev + 1))}
                        disabled={currentTargetPage >= Math.ceil(targetsData.length / targetsPerPage)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>


                
                <Button
                  onClick={handleSaveTargets}
                  disabled={isSavingTargets || Object.keys(editedTargets).length === 0}
                >
                  {isSavingTargets ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUpdateTargetsOpen(false);
                    setEditedTargets({});
                  }}
                  disabled={isSavingTargets}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // Fetch targets from backend
  async function fetchTargets() {
    setIsLoadingTargets(true);
    setCurrentTargetPage(1); // Reset to first page
    try {
      const response = await getProcessParameterTargets();
      if (response.success) {
        setTargetsData(response.targets);
        setEditedTargets({});
      } else {
        toast.error('Failed to load targets');
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to load targets'
      );
    } finally {
      setIsLoadingTargets(false);
    }
  }

  // Save updated targets to backend
  async function handleSaveTargets() {
    if (Object.keys(editedTargets).length === 0) {
      toast.warning('No changes to save');
      return;
    }

    setIsSavingTargets(true);
    try {
      const targetsToUpdate = Object.entries(editedTargets).map(([parameterId, targetValue]) => ({
        parameterId,
        targetValue
      }));

      const response = await updateProcessParameterTargets({ targets: targetsToUpdate });
      
      if (response.success) {
        toast.success(
          `Successfully updated ${response.updatedCount} target(s)`
        );
        setIsUpdateTargetsOpen(false);
        setEditedTargets({});
        
        // Refresh the targets data
        await fetchTargets();
      } else {
        toast.error('Failed to update targets');
      }
    } catch (error) {
      console.error('Error updating targets:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update targets'
      );
    } finally {
      setIsSavingTargets(false);
    }
  }
}