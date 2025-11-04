import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  LayoutDashboard, 
  Wrench, 
  TrendingUp, 
  Settings 
} from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function NavigationTabs({ activeTab, onTabChange, className }: NavigationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
        <TabsTrigger 
          value="dashboard" 
          className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger 
          value="maintenance" 
          className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Wrench className="h-4 w-4" />
          <span className="hidden sm:inline">Maintenance</span>
        </TabsTrigger>
        <TabsTrigger 
          value="optimization" 
          className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Optimization</span>
        </TabsTrigger>
        <TabsTrigger 
          value="equipment" 
          className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Equipment</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}