import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Hammer,
  Waves,
  Beaker,
  Droplet,
  Coins,
  Mountain,
  ChevronRight
} from 'lucide-react';

interface Section {
  id: string;
  name: string;
  icon: React.ReactNode;
  parameterCount: number;
  status: 'optimal' | 'caution' | 'critical';
  description: string;
}

const sections: Section[] = [
  {
    id: 'milling',
    name: 'Milling',
    icon: <Hammer className="h-6 w-6" />,
    parameterCount: 12,
    status: 'optimal',
    description: 'Grinding & size reduction'
  },
  {
    id: 'flotation',
    name: 'Flotation',
    icon: <Waves className="h-6 w-6" />,
    parameterCount: 8,
    status: 'optimal',
    description: 'Mineral separation process'
  },
  {
    id: 'cil',
    name: 'CIL',
    icon: <Beaker className="h-6 w-6" />,
    parameterCount: 15,
    status: 'caution',
    description: 'Carbon-in-leach circuit'
  },
  {
    id: 'elution',
    name: 'Elution',
    icon: <Droplet className="h-6 w-6" />,
    parameterCount: 6,
    status: 'critical',
    description: 'Carbon stripping process'
  },
  {
    id: 'gravity-circuit',
    name: 'Gravity Circuit',
    icon: <Coins className="h-6 w-6" />,
    parameterCount: 5,
    status: 'optimal',
    description: 'Gravity concentration'
  },
  {
    id: 'crusher',
    name: 'Crusher',
    icon: <Mountain className="h-6 w-6" />,
    parameterCount: 9,
    status: 'optimal',
    description: 'Primary ore crushing'
  }
];

const getStatusColor = (status: Section['status']) => {
  switch (status) {
    case 'optimal': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'caution': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
  }
};

const getStatusBorderColor = (status: Section['status']) => {
  switch (status) {
    case 'optimal': return 'border-green-400/30';
    case 'caution': return 'border-yellow-400/30';
    case 'critical': return 'border-red-400/30';
  }
};

interface CriticalParametersProps {
  onSectionClick?: (sectionId: string) => void;
}

export function CriticalParameters({ onSectionClick }: CriticalParametersProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mountain className="h-5 w-5 text-primary" />
          <span>Sections</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => onSectionClick?.(section.id)}
              className={`bg-card border-2 ${getStatusBorderColor(section.status)} rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    {section.icon}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(section.status)}
                  >
                    {section.status.toUpperCase()}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">{section.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Parameters
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {section.parameterCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}