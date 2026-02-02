import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hammer,
  Waves,
  Beaker,
  Droplet,
  Coins,
  Mountain,
  TrendingDown,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

// Downtime event interface
interface DowntimeEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  section: string;
  sectionName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  reason: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'ongoing' | 'resolved';
  reportedBy: string;
}

// Section configuration with colors
const SECTIONS = [
  { id: 'milling', name: 'Milling', icon: <Hammer className="h-5 w-5" />, color: '#3b82f6' },
  { id: 'flotation', name: 'Flotation', icon: <Waves className="h-5 w-5" />, color: '#8b5cf6' },
  { id: 'cil', name: 'CIL', icon: <Beaker className="h-5 w-5" />, color: '#06b6d4' },
  { id: 'elution', name: 'Elution', icon: <Droplet className="h-5 w-5" />, color: '#f97316' },
  { id: 'gravity-circuit', name: 'Gravity Circuit', icon: <Coins className="h-5 w-5" />, color: '#eab308' },
  { id: 'crusher', name: 'Crusher', icon: <Mountain className="h-5 w-5" />, color: '#ef4444' }
];

// Generate mock downtime data
const generateMockDowntimes = (): DowntimeEvent[] => {
  const now = new Date();
  const events: DowntimeEvent[] = [];
  
  const criticalEquipment = [
    { id: 'sag-mill', name: 'SAG Mill', section: 'milling', sectionName: 'Milling' },
    { id: 'discharge-pump-pp12', name: 'Discharge Pump PP12', section: 'milling', sectionName: 'Milling' },
    { id: 'cv-015', name: 'CV-015', section: 'milling', sectionName: 'Milling' },
    { id: 'cv-022', name: 'CV-022', section: 'milling', sectionName: 'Milling' },
    { id: 'flotation-cell-1', name: 'Flotation Cell Motor 1', section: 'flotation', sectionName: 'Flotation' },
    { id: 'flotation-cell-3', name: 'Flotation Cell Motor 3', section: 'flotation', sectionName: 'Flotation' },
    { id: 'flotation-tailings-motor', name: 'Flotation Tailings Motor', section: 'flotation', sectionName: 'Flotation' },
    { id: 'cn-dosing-pump', name: 'Cyanide Dosing Pump', section: 'cil', sectionName: 'CIL' },
    { id: 'oxygen-plant', name: 'Oxygen Generation Plant', section: 'cil', sectionName: 'CIL' },
    { id: 'carbon-screen', name: 'Carbon Screening System', section: 'cil', sectionName: 'CIL' },
    { id: 'thermomat', name: 'Thermomat', section: 'elution', sectionName: 'Elution' },
    { id: 'kiln', name: 'Kiln', section: 'elution', sectionName: 'Elution' },
    { id: 'knelson-1', name: 'Knelson 1', section: 'gravity-circuit', sectionName: 'Gravity Circuit' },
    { id: 'knelson-2', name: 'Knelson 2', section: 'gravity-circuit', sectionName: 'Gravity Circuit' },
    { id: 'crusher', name: 'Crusher', section: 'crusher', sectionName: 'Crusher' },
    { id: 'feeder-06', name: 'Feeder 06', section: 'crusher', sectionName: 'Crusher' },
    { id: 'oxide-apron-feeder', name: 'Oxide Apron Feeder', section: 'crusher', sectionName: 'Crusher' }
  ];

  const reasons = [
    { text: 'Bearing failure requiring replacement', severity: 'critical' as const },
    { text: 'Motor overheating - thermal protection triggered', severity: 'major' as const },
    { text: 'Belt slippage and misalignment', severity: 'minor' as const },
    { text: 'Scheduled preventive maintenance', severity: 'minor' as const },
    { text: 'Power supply fluctuation', severity: 'major' as const },
    { text: 'Blockage in feed chute', severity: 'major' as const },
    { text: 'Hydraulic system leak', severity: 'critical' as const },
    { text: 'Control system malfunction', severity: 'critical' as const },
    { text: 'Low reagent levels', severity: 'minor' as const },
    { text: 'External power outage', severity: 'critical' as const },
    { text: 'Gearbox failure', severity: 'critical' as const },
    { text: 'VFD fault', severity: 'major' as const },
    { text: 'Liner replacement', severity: 'minor' as const }
  ];

  const reporters = ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson', 'Mike Williams'];

  // Generate historical events
  for (let i = 0; i < 50; i++) {
    const equipment = criticalEquipment[Math.floor(Math.random() * criticalEquipment.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const reporter = reporters[Math.floor(Math.random() * reporters.length)];
    
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const startTime = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 465) + 15;
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    events.push({
      id: `dt-${i + 1}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      section: equipment.section,
      sectionName: equipment.sectionName,
      startTime,
      endTime,
      duration,
      reason: reason.text,
      severity: reason.severity,
      status: 'resolved',
      reportedBy: reporter
    });
  }

  // Add ongoing events
  const ongoingEquipment = [
    criticalEquipment[2],
    criticalEquipment[9],
    criticalEquipment[14]
  ];

  ongoingEquipment.forEach((equipment, idx) => {
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const reporter = reporters[Math.floor(Math.random() * reporters.length)];
    const hoursAgo = Math.floor(Math.random() * 4) + 1;
    const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / (60 * 1000));

    events.push({
      id: `dt-ongoing-${idx + 1}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      section: equipment.section,
      sectionName: equipment.sectionName,
      startTime,
      endTime: null,
      duration,
      reason: reason.text,
      severity: 'critical',
      status: 'ongoing',
      reportedBy: reporter
    });
  });

  return events.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface DowntimesPanelProps {
  onBack?: () => void;
}

export function DowntimesPanel({ onBack }: DowntimesPanelProps) {
  const [downtimes] = useState<DowntimeEvent[]>(generateMockDowntimes);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Recent downtimes section view state
  const [recentSectionId, setRecentSectionId] = useState<string | null>(null);
  const [recentSectionFilter, setRecentSectionFilter] = useState<string>('all');
  const [recentEventsPage, setRecentEventsPage] = useState(0);
  const [sectionPage, setSectionPage] = useState(0);
  const [downtimePage, setDowntimePage] = useState(0);
  const SECTIONS_PER_PAGE = 4;
  const DOWNTIMES_PER_PAGE = 5;
  const RECENT_EVENTS_PER_PAGE = 10;

  // Filter downtimes based on time range and status
  const filteredDowntimes = useMemo(() => {
    let filtered = [...downtimes];
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(d => d.status === selectedStatus);
    }
    
    const now = new Date();
    let cutoffDate: Date;
    switch (selectedTimeRange) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }
    filtered = filtered.filter(d => d.startTime >= cutoffDate);
    
    return filtered;
  }, [downtimes, selectedStatus, selectedTimeRange]);

  // Summary stats
  const stats = useMemo(() => {
    const ongoing = filteredDowntimes.filter(d => d.status === 'ongoing');
    const resolved = filteredDowntimes.filter(d => d.status === 'resolved');
    const totalDowntime = filteredDowntimes.reduce((sum, d) => sum + d.duration, 0);
    
    return {
      total: filteredDowntimes.length,
      ongoing: ongoing.length,
      resolved: resolved.length,
      totalDowntime
    };
  }, [filteredDowntimes]);

  // Section data for charts and cards
  const sectionData = useMemo(() => {
    const data: Record<string, { count: number; duration: number; ongoing: number; events: DowntimeEvent[] }> = {};
    SECTIONS.forEach(s => {
      data[s.id] = { count: 0, duration: 0, ongoing: 0, events: [] };
    });
    
    filteredDowntimes.forEach(d => {
      if (data[d.section]) {
        data[d.section].count++;
        data[d.section].duration += d.duration;
        data[d.section].events.push(d);
        if (d.status === 'ongoing') data[d.section].ongoing++;
      }
    });
    
    return data;
  }, [filteredDowntimes]);

  // Bar chart data for sections
  const barChartData = useMemo(() => {
    return SECTIONS.map(s => ({
      name: s.name,
      id: s.id,
      hours: Math.round(sectionData[s.id].duration / 60 * 10) / 10,
      events: sectionData[s.id].count,
      fill: s.color
    }));
  }, [sectionData]);

  // Pie chart data for sections
  const pieChartData = useMemo(() => {
    return SECTIONS.map(s => ({
      name: s.name,
      value: sectionData[s.id].count,
      color: s.color
    })).filter(d => d.value > 0);
  }, [sectionData]);

  // Equipment breakdown for selected section
  const selectedSectionEquipment = useMemo(() => {
    if (!selectedSectionId) return [];

    const events = sectionData[selectedSectionId]?.events || [];
    const equipmentMap: Record<string, { name: string; count: number; duration: number; events: DowntimeEvent[] }> = {};

    events.forEach(e => {
      if (!equipmentMap[e.equipmentId]) {
        equipmentMap[e.equipmentId] = { name: e.equipmentName, count: 0, duration: 0, events: [] };
      }
      equipmentMap[e.equipmentId].count++;
      equipmentMap[e.equipmentId].duration += e.duration;
      equipmentMap[e.equipmentId].events.push(e);
    });

    return Object.values(equipmentMap).sort((a, b) => b.duration - a.duration);
  }, [selectedSectionId, sectionData]);

  // Paginated sections for recent downtimes view
  const paginatedSections = useMemo(() => {
    const sectionsWithEvents = SECTIONS.filter(s => sectionData[s.id].count > 0);
    const start = sectionPage * SECTIONS_PER_PAGE;
    const end = start + SECTIONS_PER_PAGE;
    return {
      sections: sectionsWithEvents.slice(start, end),
      totalPages: Math.ceil(sectionsWithEvents.length / SECTIONS_PER_PAGE),
      totalSections: sectionsWithEvents.length
    };
  }, [sectionData, sectionPage]);

  // Paginated downtimes for selected section in recent view
  const paginatedRecentDowntimes = useMemo(() => {
    if (!recentSectionId) return { downtimes: [], totalPages: 0, total: 0 };

    const sectionDowntimes = filteredDowntimes.filter(d => d.section === recentSectionId);
    const start = downtimePage * DOWNTIMES_PER_PAGE;
    const end = start + DOWNTIMES_PER_PAGE;

    return {
      downtimes: sectionDowntimes.slice(start, end),
      totalPages: Math.ceil(sectionDowntimes.length / DOWNTIMES_PER_PAGE),
      total: sectionDowntimes.length
    };
  }, [recentSectionId, filteredDowntimes, downtimePage]);

  // Filtered events for recent events section based on section filter
  const recentFilteredEvents = useMemo(() => {
    if (recentSectionFilter === 'all') {
      return filteredDowntimes;
    }
    return filteredDowntimes.filter(d => d.section === recentSectionFilter);
  }, [filteredDowntimes, recentSectionFilter]);

  // Paginated recent events for the list
  const paginatedRecentEvents = useMemo(() => {
    const total = recentFilteredEvents.length;
    const totalPages = Math.ceil(total / RECENT_EVENTS_PER_PAGE) || 1;
    const page = Math.min(recentEventsPage, totalPages - 1);
    const start = page * RECENT_EVENTS_PER_PAGE;
    const end = start + RECENT_EVENTS_PER_PAGE;
    return {
      events: recentFilteredEvents.slice(start, end),
      page,
      totalPages,
      total,
      start: total === 0 ? 0 : start + 1,
      end: Math.min(end, total)
    };
  }, [recentFilteredEvents, recentEventsPage]);

  // Reset recent events page when section filter changes
  useEffect(() => {
    setRecentEventsPage(0);
  }, [recentSectionFilter]);

  // Reset downtime page when section changes
  const handleRecentSectionSelect = (sectionId: string) => {
    setRecentSectionId(sectionId);
    setDowntimePage(0);
  };

  // Go back to section list
  const handleBackToSections = () => {
    setRecentSectionId(null);
    setDowntimePage(0);
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'major': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'minor': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const selectedSection = SECTIONS.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              Equipment Downtimes
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Track and analyze equipment downtime by section
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-28 sm:w-32">
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-28 sm:w-32">
              <Activity className="h-4 w-4 mr-1 sm:mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Events</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-400/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ongoing</p>
                <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.ongoing}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-400/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Downtime</p>
                <p className="text-xl sm:text-2xl font-bold">{formatDuration(stats.totalDowntime)}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Cards - Clickable */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary" />
          Downtime by Section
          <span className="text-sm font-normal text-muted-foreground">(click to view details)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SECTIONS.map(section => {
            const data = sectionData[section.id];
            const hasOngoing = data.ongoing > 0;
            
            return (
              <Card 
                key={section.id}
                className={`border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${hasOngoing ? 'border-red-400/50' : ''}`}
                onClick={() => handleSectionClick(section.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${section.color}20` }}>
                      <span style={{ color: section.color }}>{section.icon}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{section.name}</h4>
                  <div className="space-y-1">
                    <p className="text-lg font-bold">{formatDuration(data.duration)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{data.count} events</span>
                      {hasOngoing && (
                        <Badge variant="outline" className="text-red-400 bg-red-400/10 border-red-400/20 text-xs px-2 py-0.5 ml-1">
                          {data.ongoing} active
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Downtime Hours by Section */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Downtime Hours by Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#e5e7eb" 
                    fontSize={12}
                    tick={{ fill: '#e5e7eb', fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    stroke="#e5e7eb" 
                    fontSize={12} 
                    tick={{ fill: '#e5e7eb' }}
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#e5e7eb', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
                    itemStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number) => [`${value} hours`, 'Duration']}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="hours" 
                    name="Hours"
                    radius={[4, 4, 0, 0]}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Events by Section */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Events by Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#f3f4f6'
                    }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
                    itemStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number) => [`${value} events`, 'Count']}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                    formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events - Mobile Friendly Cards */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Downtime Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Section Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setRecentSectionFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                recentSectionFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              All
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                {filteredDowntimes.length}
              </span>
            </button>
            {SECTIONS.map((section) => {
              const count = sectionData[section.id]?.count || 0;
              if (count === 0) return null;
              return (
                <button
                  key={section.id}
                  onClick={() => setRecentSectionFilter(section.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                    recentSectionFilter === section.id
                      ? 'text-white'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                  style={recentSectionFilter === section.id ? { backgroundColor: section.color } : {}}
                >
                  {section.name}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {paginatedRecentEvents.events.map((event) => (
              <div 
                key={event.id} 
                className="p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{event.equipmentName}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {event.sectionName}
                      </Badge>
                      <Badge variant="outline" className={`text-xs shrink-0 ${getStatusColor(event.status)}`}>
                        {event.status === 'ongoing' ? (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                            Ongoing
                          </span>
                        ) : 'Resolved'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm shrink-0">
                    <div className="text-right">
                      <p className={`font-medium ${event.status === 'ongoing' ? 'text-red-400' : ''}`}>
                        {formatDuration(event.duration)}
                      </p>
                      <p className="text-muted-foreground text-xs">{formatDateTime(event.startTime)}</p>
                    </div>
                    <Badge variant="outline" className={`${getSeverityColor(event.severity)} text-xs`}>
                      {event.severity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {paginatedRecentEvents.total === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No downtime events found for the selected filters
              </p>
            )}
          </div>
          {paginatedRecentEvents.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground order-2 sm:order-1">
                Showing {paginatedRecentEvents.start}–{paginatedRecentEvents.end} of {paginatedRecentEvents.total} events
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentEventsPage((p) => Math.max(0, p - 1))}
                  disabled={paginatedRecentEvents.page === 0}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  Page {paginatedRecentEvents.page + 1} of {paginatedRecentEvents.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecentEventsPage((p) => Math.min(paginatedRecentEvents.totalPages - 1, p + 1))}
                  disabled={paginatedRecentEvents.page >= paginatedRecentEvents.totalPages - 1}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSection && (
                <>
                  <span style={{ color: selectedSection.color }}>{selectedSection.icon}</span>
                  <span>{selectedSection.name} - Equipment Breakdown</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Downtime breakdown by equipment in this section
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Section Summary */}
            {selectedSectionId && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Events</p>
                  <p className="text-xl font-bold">{sectionData[selectedSectionId].count}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Downtime</p>
                  <p className="text-xl font-bold">{formatDuration(sectionData[selectedSectionId].duration)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Ongoing</p>
                  <p className="text-xl font-bold text-red-400">{sectionData[selectedSectionId].ongoing}</p>
                </div>
              </div>
            )}

            {/* Equipment List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Equipment Downtime</h4>
              {selectedSectionEquipment.map((eq, idx) => (
                <div key={idx} className="p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-sm">{eq.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatDuration(eq.duration)}</p>
                      <p className="text-xs text-muted-foreground">{eq.count} events</p>
                    </div>
                  </div>
                  
                  {/* Recent events for this equipment */}
                  <div className="mt-2 space-y-1">
                    {eq.events.slice(0, 3).map((event, eIdx) => (
                      <div key={eIdx} className="flex items-center justify-between text-xs p-2 bg-background/50 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className={`${getStatusColor(event.status)} text-xs shrink-0`}>
                            {event.status === 'ongoing' ? 'Active' : 'Done'}
                          </Badge>
                          <span className="text-muted-foreground truncate">{event.reason}</span>
                        </div>
                        <span className="text-muted-foreground shrink-0 ml-2">{formatDuration(event.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedSectionEquipment.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No downtime events in this section
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
