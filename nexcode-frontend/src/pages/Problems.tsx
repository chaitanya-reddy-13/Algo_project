import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DifficultyBadge } from '@/components/problem/DifficultyBadge';
import { Search, Filter } from 'lucide-react';
import { problemsAPI, Problem } from '@/lib/api';

export function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemsAPI.getProblems({
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        });
        // Handle both paginated and non-paginated responses
        const problemsData = response.data.results || response.data;
        setProblems(problemsData);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [difficultyFilter]);

  const filteredProblems = (problems || []).filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold">Problems</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search problems or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-code-bg border-code-border"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40 bg-code-bg border-code-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProblems.map((problem) => (
          <Link key={problem.id} to={`/problems/${problem.id}`}>
            <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {problem.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {problem.description.substring(0, 150)}...
                    </CardDescription>
                  </div>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {(problem.tags || []).slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {problem.tags && problem.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{problem.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProblems.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No problems found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}