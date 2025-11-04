import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  Send, 
  CheckCircle, 
  Clock,
  Wrench,
  Zap,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BreakdownReport {
  id: string;
  equipment: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  reportedBy: string;
  timestamp: string;
  category: string;
}

interface BreakdownReporterProps {
  onReportSubmit: (report: BreakdownReport) => void;
}

export function BreakdownReporter({ onReportSubmit }: BreakdownReporterProps) {
  const [equipment, setEquipment] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('warning');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReports, setRecentReports] = useState<BreakdownReport[]>([]);

  const equipmentOptions = [
    'Primary Crusher 1',
    'Primary Crusher 2', 
    'Secondary Crusher 3',
    'Ball Mill 1',
    'Ball Mill 2',
    'Flotation Cell Bank 1',
    'Flotation Cell Bank 2',
    'Gravity Concentrator 1',
    'Gravity Concentrator 2',
    'CIL Tank 1',
    'CIL Tank 2', 
    'CIL Tank 3',
    'Vibrating Screen 33',
    'Vibrating Screen 34',
    'Thickener 1',
    'Thickener 2',
    'Elution Column',
    'Carbon Regeneration Kiln'
  ];

  const categoryOptions = [
    'Mechanical Failure',
    'Electrical Fault',
    'Process Deviation',
    'Safety Issue',
    'Environmental Concern',
    'Instrumentation Error',
    'Material Shortage',
    'Maintenance Required'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !description.trim() || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newReport: BreakdownReport = {
        id: Date.now().toString(),
        equipment,
        severity,
        description: description.trim(),
        reportedBy: 'Admin User',
        timestamp: 'Just now',
        category
      };

      // Add to recent reports
      setRecentReports(prev => [newReport, ...prev.slice(0, 4)]);
      
      // Call parent callback to add to alerts
      onReportSubmit(newReport);
      
      // Show success notification
      toast.success('Breakdown report submitted successfully', {
        description: `Alert created for ${equipment}`,
      });

      // Reset form
      setEquipment('');
      setDescription('');
      setCategory('');
      setSeverity('warning');
      setIsSubmitting(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'warning': return <Wrench className="h-3 w-3" />;
      case 'info': return <Activity className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Form */}
      <div className="space-y-4 px-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment *</label>
                <Select value={equipment} onValueChange={setEquipment}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentOptions.map((eq) => (
                      <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity *</label>
                <Select value={severity} onValueChange={(value: 'critical' | 'warning' | 'info') => setSeverity(value)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span>Critical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4 text-yellow-400" />
                        <span>Warning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span>Info</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the breakdown or issue in detail..."
                className="bg-input border-border min-h-[80px]"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/500 characters
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !equipment || !description.trim() || !category}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Submitting Report...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Submit Report</span>
                </div>
              )}
            </Button>
          </form>
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span>Recent Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className={getSeverityColor(report.severity)}>
                      <div className="flex items-center space-x-1">
                        {getSeverityIcon(report.severity)}
                        <span>{report.severity.toUpperCase()}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{report.equipment}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{report.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{report.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Reported by {report.reportedBy}</span>
                      <span>•</span>
                      <span>{report.timestamp}</span>
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}