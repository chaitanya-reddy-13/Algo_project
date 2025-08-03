import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertTriangle, Code } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: string;
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const config = {
    Pending: {
      className: 'bg-warning/20 text-warning border-warning/30',
      icon: Clock,
    },
    Accepted: {
      className: 'bg-success/20 text-success border-success/30',
      icon: Check,
    },
    'Wrong Answer': {
      className: 'bg-destructive/20 text-destructive border-destructive/30',
      icon: X,
    },
    'Time Limit Exceeded': {
      className: 'bg-warning/20 text-warning border-warning/30',
      icon: AlertTriangle,
    },
    'Compilation Error': {
      className: 'bg-destructive/20 text-destructive border-destructive/30',
      icon: Code,
    },
    'Runtime Error': {
      className: 'bg-destructive/20 text-destructive border-destructive/30',
      icon: AlertTriangle,
    },
    'Memory Limit Exceeded': {
      className: 'bg-warning/20 text-warning border-warning/30',
      icon: AlertTriangle,
    },
  };

  // Get config for the verdict, or use a default for unknown verdicts
  const verdictConfig = config[verdict] || {
    className: 'bg-muted/20 text-muted-foreground border-muted/30',
    icon: AlertTriangle,
  };

  const { className, icon: Icon } = verdictConfig;

  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {verdict}
    </Badge>
  );
}