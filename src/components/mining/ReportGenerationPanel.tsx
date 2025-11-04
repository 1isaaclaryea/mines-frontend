import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Calendar,
  BarChart3,
  AlertCircle,
  Settings,
  TrendingUp,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { mockKPIs, mockAlerts, mockEquipment, mockProductionData } from './mockData';

interface ReportConfig {
  title: string;
  description: string;
  dateRange: {
    from: string;
    to: string;
  };
  sections: {
    kpis: boolean;
    production: boolean;
    equipment: boolean;
    alerts: boolean;
    maintenance: boolean;
    parameters: boolean;
  };
  format: 'pdf' | 'excel';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
}

interface ReportGenerationPanelProps {
  onBack?: () => void;
}

export function ReportGenerationPanel({ onBack }: ReportGenerationPanelProps = {}) {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    description: '',
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    sections: {
      kpis: true,
      production: true,
      equipment: true,
      alerts: true,
      maintenance: false,
      parameters: false
    },
    format: 'pdf',
    frequency: 'once'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);


  const reportTemplates = [
    {
      id: 'daily-ops',
      name: 'Daily Operations Summary',
      description: 'Daily KPIs, production metrics, and critical alerts',
      sections: { kpis: true, production: true, equipment: true, alerts: true, maintenance: false, parameters: false }
    },
    {
      id: 'weekly-performance',
      name: 'Weekly Performance Report',
      description: 'Comprehensive weekly analysis with trends and maintenance',
      sections: { kpis: true, production: true, equipment: true, alerts: true, maintenance: true, parameters: true }
    },
    {
      id: 'equipment-status',
      name: 'Equipment Status Report',
      description: 'Detailed equipment health and maintenance schedule',
      sections: { kpis: false, production: false, equipment: true, alerts: true, maintenance: true, parameters: false }
    },
    {
      id: 'compliance',
      name: 'Regulatory Compliance Report',
      description: 'Environmental parameters and safety metrics',
      sections: { kpis: true, production: false, equipment: false, alerts: true, maintenance: false, parameters: true }
    }
  ];

  const handleTemplateSelect = (template: typeof reportTemplates[0]) => {
    setReportConfig(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      sections: template.sections
    }));
    toast.success(`Applied template: ${template.name}`);
  };

  const simulateReportGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const steps = [
      'Collecting KPI data...',
      'Processing production metrics...',
      'Analyzing equipment status...',
      'Compiling alerts and incidents...',
      'Generating visualizations...',
      'Formatting report...',
      'Finalizing export...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress((i + 1) / steps.length * 100);
      toast.info(steps[i]);
    }

    setIsGenerating(false);
    setGenerationProgress(0);
    toast.success(`${reportConfig.format.toUpperCase()} report generated successfully!`);
  };

  const handleGenerateReport = async () => {
    if (!reportConfig.title.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    await simulateReportGeneration();
  };

  const getSelectedSectionsCount = () => {
    return Object.values(reportConfig.sections).filter(Boolean).length;
  };

  const formatFileSize = (sections: number) => {
    const baseSize = 2.5; // MB
    const sectionSize = 0.8; // MB per section
    return (baseSize + sections * sectionSize).toFixed(1);
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
            <h2 className="text-2xl">Report Generation</h2>
          </div>
          <p className="text-muted-foreground">
            Create comprehensive reports from your metallurgical operations data
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Quick Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <h4 className="font-medium mb-1">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{Object.values(template.sections).filter(Boolean).length} sections</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Report Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter report title..."
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the report purpose..."
                    value={reportConfig.description}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-date">From</Label>
                    <Input
                      id="from-date"
                      type="date"
                      value={reportConfig.dateRange.from}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to-date">To</Label>
                    <Input
                      id="to-date"
                      type="date"
                      value={reportConfig.dateRange.to}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Report Sections */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Report Sections</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'kpis', label: 'Key Performance Indicators', icon: TrendingUp },
                    { key: 'production', label: 'Production Metrics', icon: BarChart3 },
                    { key: 'equipment', label: 'Equipment Status', icon: Settings },
                    { key: 'alerts', label: 'Alerts & Incidents', icon: AlertCircle },
                    { key: 'maintenance', label: 'Maintenance Schedule', icon: CheckCircle2 },
                    { key: 'parameters', label: 'Critical Parameters', icon: FileText }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center space-x-3">
                      <Checkbox
                        id={key}
                        checked={reportConfig.sections[key as keyof typeof reportConfig.sections]}
                        onCheckedChange={(checked: boolean) => 
                          setReportConfig(prev => ({
                            ...prev,
                            sections: { ...prev.sections, [key]: checked }
                          }))
                        }
                      />
                      <Label htmlFor={key} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Export Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={reportConfig.format}
                      onValueChange={(value: 'pdf' | 'excel') => 
                        setReportConfig(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-red-500" />
                            <span>PDF Report</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-500" />
                            <span>Excel Workbook</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={reportConfig.frequency}
                      onValueChange={(value: typeof reportConfig.frequency) => 
                        setReportConfig(prev => ({ ...prev, frequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sections</span>
                  <Badge variant="secondary">{getSelectedSectionsCount()} selected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Format</span>
                  <Badge variant={reportConfig.format === 'pdf' ? 'destructive' : 'default'}>
                    {reportConfig.format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Est. Size</span>
                  <span className="text-sm">{formatFileSize(getSelectedSectionsCount())} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span className="text-sm capitalize">{reportConfig.frequency}</span>
                </div>
              </div>

              <Separator />

              {/* Generation Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating report...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || getSelectedSectionsCount() === 0}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : `Generate ${reportConfig.format.toUpperCase()}`}
              </Button>

              {reportConfig.frequency !== 'once' && (
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Daily Operations Summary', date: '2 hours ago', format: 'PDF', size: '3.2 MB' },
                  { name: 'Weekly Performance', date: 'Yesterday', format: 'Excel', size: '5.8 MB' },
                  { name: 'Equipment Status', date: '3 days ago', format: 'PDF', size: '2.1 MB' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {report.format}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}