import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Clock, Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";

interface HistoryEntry {
  timestamp: string;
  value: number;
  unit: string;
  status: 'optimal' | 'caution' | 'critical';
}

interface KPIHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  history: HistoryEntry[];
  icon?: React.ReactNode;
}

export function KPIHistoryDialog({
  open,
  onOpenChange,
  title,
  history,
  icon,
}: KPIHistoryDialogProps) {
  const [entryCount, setEntryCount] = useState(5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'caution': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleIncrement = () => {
    setEntryCount(prev => Math.min(prev + 1, history.length));
  };

  const handleDecrement = () => {
    setEntryCount(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= history.length) {
      setEntryCount(value);
    }
  };

  const displayedHistory = history.slice(0, entryCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <span>{title} - Recent Entries</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Historical data for recent hours
          </DialogDescription>
        </DialogHeader>
        
        {/* Entry Count Control */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">Number of entries:</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrement}
              disabled={entryCount <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <input
              type="number"
              min="1"
              max={history.length}
              value={entryCount}
              onChange={handleInputChange}
              className="w-16 h-8 text-center bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrement}
              disabled={entryCount >= history.length}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable History Container */}
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
          {displayedHistory.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-muted-foreground/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    {entry.timestamp}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {entry.value}
                    <span className="text-sm text-muted-foreground ml-1">
                      {entry.unit}
                    </span>
                  </div>
                </div>
                
                <Badge className={`${getStatusColor(entry.status)} border min-w-[80px] justify-center`}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
