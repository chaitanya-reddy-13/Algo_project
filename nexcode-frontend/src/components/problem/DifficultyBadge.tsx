import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variants = {
    Easy: 'bg-success/20 text-success border-success/30',
    Medium: 'bg-warning/20 text-warning border-warning/30',
    Hard: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <Badge variant="outline" className={variants[difficulty]}>
      {difficulty}
    </Badge>
  );
}