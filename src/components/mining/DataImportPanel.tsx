import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Download,
  ArrowLeft
} from "lucide-react";

interface DataImportPanelProps {
  className?: string;
  onBack?: () => void;
}

export function DataImportPanel({ className, onBack }: DataImportPanelProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const recentImports = [
    {
      id: '1',
      filename: 'production_data_2024_09.csv',
      timestamp: '2024-09-09 14:30',
      records: 25847,
      status: 'success' as const,
      type: 'CSV'
    },
    {
      id: '2',
      filename: 'equipment_sensors_sept.sql',
      timestamp: '2024-09-09 12:15',
      records: 89234,
      status: 'success' as const,
      type: 'SQL'
    },
    {
      id: '3',
      filename: 'maintenance_logs.xlsx',
      timestamp: '2024-09-09 09:45',
      records: 1247,
      status: 'processing' as const,
      type: 'Excel'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                
              </Button>
            )}
            <h2 className="text-xl sm:text-2xl font-bold">Data Import</h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">Import historian data from various sources</p>
        </div>
        <Button variant="outline" className="border-border w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border h-auto">
          <TabsTrigger value="file-upload" className="text-xs sm:text-sm p-3 sm:p-4 flex-1">
            <span className="block text-center leading-tight">File Upload</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="text-xs sm:text-sm p-3 sm:p-4 flex-1">
            <span className="block text-center leading-tight">Database</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm p-3 sm:p-4 flex-1">
            <span className="block text-center leading-tight">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file-upload" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-400" />
                <span>File Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Data Files</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.sql,.json"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-3">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">Drop files here or click to browse</p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: CSV, Excel, SQL, JSON
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">Upload completed successfully</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production Data</SelectItem>
                      <SelectItem value="sensors">Sensor Readings</SelectItem>
                      <SelectItem value="maintenance">Maintenance Logs</SelectItem>
                      <SelectItem value="alarms">Alarm History</SelectItem>
                      <SelectItem value="quality">Quality Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-hour">Last Hour</SelectItem>
                      <SelectItem value="last-day">Last 24 Hours</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-400" />
                <span>Database Connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server Address</Label>
                  <Input 
                    placeholder="historian.company.com" 
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input 
                    placeholder="1433" 
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database Name</Label>
                  <Input 
                    placeholder="historian_db" 
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Authentication</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select auth method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql-auth">SQL Server Authentication</SelectItem>
                      <SelectItem value="windows-auth">Windows Authentication</SelectItem>
                      <SelectItem value="azure-ad">Azure AD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>SQL Query</Label>
                <Textarea 
                  placeholder="SELECT * FROM production_data WHERE timestamp >= '2024-09-01'"
                  className="bg-input border-border min-h-[100px]"
                />
              </div>

              <Button className="w-full">
                Test Connection & Import
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-400" />
                <span>API Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input 
                  placeholder="https://api.historian.com/v1/data" 
                  className="bg-input border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    placeholder="Your API key" 
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Response format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Parameters</Label>
                <Textarea 
                  placeholder='{"start_time": "2024-09-01T00:00:00Z", "end_time": "2024-09-09T23:59:59Z", "tags": ["temperature", "pressure"]}'
                  className="bg-input border-border min-h-[80px]"
                />
              </div>

              <Button className="w-full">
                Connect & Import Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentImports.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border bg-card/50 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium text-sm break-all">{item.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.records.toLocaleString()} records • {item.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <Badge className={`${getStatusColor(item.status)} border text-xs`}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}