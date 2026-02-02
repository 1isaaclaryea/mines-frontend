import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  XCircle,
  Clock,
  Hammer,
  Waves,
  Beaker,
  Droplet,
  Coins,
  Mountain,
  Activity,
  ChevronRight
} from 'lucide-react';

interface CriticalEquipment {
  id: string;
  name: string;
  section: string;
  sectionName: string;
  status: 'offline' | 'critical';
  downSince: Date;
  reason: string;
}

const SECTIONS = [
  { id: 'milling', name: 'Milling', icon: <Hammer className="h-4 w-4" />, color: '#3b82f6' },
  { id: 'flotation', name: 'Flotation', icon: <Waves className="h-4 w-4" />, color: '#8b5cf6' },
  { id: 'cil', name: 'CIL', icon: <Beaker className="h-4 w-4" />, color: '#06b6d4' },
  { id: 'elution', name: 'Elution', icon: <Droplet className="h-4 w-4" />, color: '#f97316' },
  { id: 'gravity-circuit', name: 'Gravity Circuit', icon: <Coins className="h-4 w-4" />, color: '#eab308' },
  { id: 'crusher', name: 'Crusher', icon: <Mountain className="h-4 w-4" />, color: '#ef4444' }
];

// Generate mock critical equipment data
const generateCriticalEquipment = (): CriticalEquipment[] => {
  const now = new Date();

  return [
    {
      id: 'cv-015',
      name: 'CV-015',
      section: 'milling',
      sectionName: 'Milling',
      status: 'offline',
      downSince: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
      reason: 'Belt slippage and misalignment'
    },
    {
      id: 'carbon-screen',
      name: 'Carbon Screening System',
      section: 'cil',
      sectionName: 'CIL',
      status: 'offline',
      downSince: new Date(now.getTime() - 1.2 * 60 * 60 * 1000),
      reason: 'Motor overheating - thermal protection triggered'
    },
    {
      id: 'crusher',
      name: 'Main Crusher',
      section: 'crusher',
      sectionName: 'Crusher',
      status: 'offline',
      downSince: new Date(now.getTime() - 45 * 60 * 1000),
      reason: 'Hydraulic system leak'
    },
    {
      id: 'knelson-1',
      name: 'Knelson 1',
      section: 'gravity-circuit',
      sectionName: 'Gravity Circuit',
      status: 'critical',
      downSince: new Date(now.getTime() - 30 * 60 * 1000),
      reason: 'Low feed pressure warning'
    },
    {
      id: 'flotation-cell-3',
      name: 'Flotation Cell Motor 3',
      section: 'flotation',
      sectionName: 'Flotation',
      status: 'critical',
      downSince: new Date(now.getTime() - 15 * 60 * 1000),
      reason: 'VFD fault detected'
    }
  ];
};

const formatDuration = (startDate: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

interface CriticalEquipmentDashboardProps {
  onViewSection?: (sectionId: string) => void;
}

export function CriticalEquipmentDashboard({ onViewSection }: CriticalEquipmentDashboardProps) {
  const [criticalEquipment] = useState<CriticalEquipment[]>(generateCriticalEquipment);

  const offlineCount = useMemo(() =>
    criticalEquipment.filter(e => e.status === 'offline').length,
    [criticalEquipment]
  );

  const criticalCount = useMemo(() =>
    criticalEquipment.filter(e => e.status === 'critical').length,
    [criticalEquipment]
  );

  const groupedBySection = useMemo(() => {
    const groups: Record<string, CriticalEquipment[]> = {};
    criticalEquipment.forEach(eq => {
      if (!groups[eq.section]) {
        groups[eq.section] = [];
      }
      groups[eq.section].push(eq);
    });
    return groups;
  }, [criticalEquipment]);

  const getSectionConfig = (sectionId: string) => {
    return SECTIONS.find(s => s.id === sectionId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Critical Equipment Status
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Equipment requiring immediate attention
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Offline</p>
                <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Critical</p>
                <p className="text-2xl font-bold text-yellow-500">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      {criticalEquipment.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-500">All Systems Operational</p>
            <p className="text-sm text-muted-foreground mt-1">No critical equipment issues detected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedBySection).map(([sectionId, equipment]) => {
            const sectionConfig = getSectionConfig(sectionId);
            if (!sectionConfig) return null;

            return (
              <Card key={sectionId} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onViewSection?.(sectionId)}
                  style={{ borderLeft: `4px solid ${sectionConfig.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {sectionConfig.icon}
                      {sectionConfig.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {equipment.length} issue{equipment.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {equipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {eq.status === 'offline' ? (
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <span className="font-medium text-sm truncate">{eq.name}</span>
                            <Badge
                              className={`text-xs flex-shrink-0 ${
                                eq.status === 'offline'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}
                            >
                              {eq.status === 'offline' ? 'Offline' : 'Critical'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(eq.downSince)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground text-center">
        Tap on a section to view detailed equipment status
      </p>
    </div>
  );
}
