import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DifficultyBadge } from '@/components/problem/DifficultyBadge';
import { CodeEditor } from '@/components/problem/CodeEditor';
import { AIAssistant } from '@/components/problem/AIAssistant';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { problemsAPI, submissionsAPI, Problem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      
      try {
        const response = await problemsAPI.getProblem(parseInt(id));
        setProblem(response.data);
      } catch (error) {
        console.error('Failed to fetch problem:', error);
        toast({
          title: "Error",
          description: "Failed to load problem details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, toast]);

  const handleSubmit = async (code: string, language: string) => {
    if (!problem) return;

    setSubmitting(true);
    try {
      await submissionsAPI.submitSolution(problem.id, code, language);
      toast({
        title: "Success",
        description: "Solution submitted successfully! Check submissions page for results.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to submit solution:', error);
      toast({
        title: "Error", 
        description: "Failed to submit solution",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const handleAIAssistantClick = () => {
    setIsAIAssistantOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-code-border">
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Problem not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/problems">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/problems">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAIAssistantClick}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Ask AI Assistant
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{problem.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4">
              <Card className="bg-gradient-card border-border">
                <CardContent className="pt-6">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="constraints" className="space-y-4">
              <Card className="bg-gradient-card border-border">
                <CardContent className="pt-6">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.constraints}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Code Editor */}
        <div>
          <CodeEditor
            problemId={problem.id}
            starterCode={problem.starter_code}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            onCodeChange={handleCodeChange}
            onAIAssistantClick={handleAIAssistantClick}
          />
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        problemId={problem.id}
        problemTitle={problem.title}
        problemDescription={problem.description}
        problemConstraints={problem.constraints}
        currentCode={currentCode}
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </div>
  );
}