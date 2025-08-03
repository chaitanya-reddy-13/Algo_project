import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, Users, Clock, Play, CheckCircle, XCircle, AlertTriangle, Code, FileText, Target, Zap, Settings, MoreVertical, ChevronRight, Timer, Award, Sparkles, ChevronLeft, Menu } from 'lucide-react';
import { contestsAPI, submissionsAPI } from '@/lib/api';
import { TestResults } from '@/components/problem/TestResults';
import Editor from '@monaco-editor/react';

interface ContestProblem {
  id: number;
  problem: {
    id: number;
    title: string;
    description: string;
    constraints: string;
    difficulty: string;
    tags: string[];
    starter_code: string;
  };
  order: number;
  points: number;
}

interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_public: boolean;
  allow_registration: boolean;
  max_participants: number | null;
  participant_count: number;
  is_running: boolean;
  is_upcoming: boolean;
  is_ended: boolean;
  created_by: {
    id: number;
    username: string;
  };
  created_at: string;
}

interface ContestSubmission {
  id: number;
  problem: number;
  code: string;
  language: string;
  verdict: string;
  submitted_at: string;
}

export function ContestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<ContestProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ContestProblem | null>(null);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isParticipating, setIsParticipating] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('python');
  const [testResults, setTestResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchContestData = async () => {
      if (!id) return;
      
      try {
        console.log('Fetching contest data for ID:', id);
        
        const [contestResponse, problemsResponse, submissionsResponse] = await Promise.all([
          contestsAPI.getContest(parseInt(id)),
          contestsAPI.getContestProblems(parseInt(id)),
          contestsAPI.getContestSubmissions(parseInt(id))
        ]);

        console.log('Contest response:', contestResponse.data);
        console.log('Problems response:', problemsResponse.data);
        console.log('Submissions response:', submissionsResponse.data);

        setContest(contestResponse.data);
        setProblems(problemsResponse.data.results || problemsResponse.data);
        setSubmissions(submissionsResponse.data.results || submissionsResponse.data);

        const problemsData = problemsResponse.data.results || problemsResponse.data;
        console.log('Problems data:', problemsData);
        
        if (problemsData && problemsData.length > 0) {
          setSelectedProblem(problemsData[0]);
          setCurrentCode(problemsData[0].problem.starter_code);
        }
      } catch (error) {
        console.error('Failed to fetch contest data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [id]);

  useEffect(() => {
    if (!contest) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(contest.end_time).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsParticipating(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isParticipating) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be saved.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isParticipating]);

  const startParticipation = async () => {
    try {
      await contestsAPI.registerForContest(parseInt(id!));
      setIsParticipating(true);
    } catch (error: any) {
      console.error('Failed to start participation:', error);
      alert(error.response?.data?.error || 'Failed to start participation');
    }
  };

  const handleExitContest = async () => {
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    try {
      if (selectedProblem && currentCode.trim()) {
        await contestsAPI.submitContestSolution(
          parseInt(id!),
          selectedProblem.problem.id,
          currentCode,
          currentLanguage
        );
      }
      setIsParticipating(false);
      setShowExitDialog(false);
      navigate('/contests');
    } catch (error) {
      console.error('Failed to submit solution:', error);
      setIsParticipating(false);
      setShowExitDialog(false);
      navigate('/contests');
    }
  };

  const runTest = async () => {
    if (!selectedProblem) return;
    
    try {
      const response = await submissionsAPI.runTest(
        selectedProblem.problem.id,
        currentCode,
        currentLanguage
      );
      setTestResults(response.data);
      
      // Show simple feedback for non-hidden test cases
      const { summary } = response.data;
      if (summary && summary.passed !== undefined && summary.total !== undefined) {
        alert(`Test Results: ${summary.passed}/${summary.total} test cases passed`);
      }
    } catch (error) {
      console.error('Failed to run test:', error);
      alert('Failed to run test');
    }
  };

  const submitSolution = async () => {
    if (!selectedProblem) return;
    
    setIsSubmitting(true);
    try {
      await contestsAPI.submitContestSolution(
        parseInt(id!),
        selectedProblem.problem.id,
        currentCode,
        currentLanguage
      );
      
      // Simple feedback
      alert('Answer submitted');
      
      // Refresh submissions list
      const submissionsResponse = await contestsAPI.getContestSubmissions(parseInt(id!));
      setSubmissions(submissionsResponse.data.results || submissionsResponse.data);
      
    } catch (error) {
      console.error('Failed to submit solution:', error);
      alert('Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (contest: Contest) => {
    if (contest.is_running) {
      return <Badge className="bg-success text-foreground border-0 px-3 py-1 font-medium">
        <div className="w-2 h-2 bg-foreground rounded-full mr-2 animate-pulse" />
        Live
      </Badge>;
    } else if (contest.is_ended) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 px-3 py-1 font-medium">Ended</Badge>;
    } else {
      return <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10 px-3 py-1 font-medium">Upcoming</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'hard': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-xl w-1/3" />
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gradient-card border-border shadow-card">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Contest not found</h2>
          <p className="text-muted-foreground">The contest you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!isParticipating && contest.is_running) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-card border border-border rounded-full px-4 py-2 shadow-card mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Premium Contest</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{contest.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{contest.description}</p>
            {getStatusBadge(contest)}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Time Remaining</p>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 bg-primary rounded-xl">
                    <Timer className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Participants</p>
                    <div className="text-2xl font-bold text-foreground">
                      {contest.participant_count?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-3 bg-accent rounded-xl">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Problems</p>
                    <div className="text-2xl font-bold text-foreground">
                      {problems.length}
                    </div>
                  </div>
                  <div className="p-3 bg-success rounded-xl">
                    <Target className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button 
              onClick={startParticipation} 
              size="xl"
              variant="hero"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-3" />
              Join Contest
            </Button>
            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
              Once you start, the timer begins. You can exit anytime and your progress will be saved automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isParticipating) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Top Navigation Bar */}
        <div className="bg-gradient-card border-b border-border shadow-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Code className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{contest.title}</h1>
                    <p className="text-sm text-muted-foreground">Contest in progress</p>
                  </div>
                </div>
                
                <div className="hidden lg:flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{problems?.length || 0} Problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">{selectedProblem?.points || 0} Points</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-lg shadow-primary">
                  <div className="text-lg font-mono font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-primary-foreground/80 text-center">Time Left</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleExitContest}
                  className="shadow-card"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Exit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problems Sidebar */}
          {!sidebarCollapsed && (
            <div className="w-80 bg-gradient-card border-r border-border overflow-hidden transition-all duration-300 ease-in-out">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">Problems</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="space-y-3">
                    {(problems || []).map((problem, index) => (
                      <div
                        key={problem.id}
                        onClick={() => {
                          setSelectedProblem(problem);
                          setCurrentCode(problem.problem.starter_code);
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedProblem?.id === problem.id
                            ? 'border-primary bg-primary/10 shadow-glow'
                            : 'border-border bg-gradient-card hover:border-primary/50 hover:shadow-card'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              selectedProblem?.id === problem.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <Badge className={`text-xs px-2 py-1 border ${getDifficultyColor(problem.problem.difficulty)}`}>
                              {problem.problem.difficulty}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs font-bold text-warning bg-warning/10 border-warning/20">
                            {problem.points}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {problem.problem.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-1">
                          {problem.problem.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                              {tag}
                            </Badge>
                          ))}
                          {problem.problem.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                              +{problem.problem.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Problem & Code Area */}
          {selectedProblem && (
            <div className="flex-1 flex overflow-hidden">
              {/* Problem Description */}
              <div className={`${sidebarCollapsed ? 'w-1/2' : 'w-1/2'} border-r border-border overflow-hidden bg-gradient-card transition-all duration-300`}>
                <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      {sidebarCollapsed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSidebarCollapsed(false)}
                          className="p-2 h-8 w-8 mr-2"
                        >
                          <Menu className="h-4 w-4" />
                        </Button>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{selectedProblem.problem.title}</h2>
                        <div className="flex items-center gap-3">
                          <Badge className={`px-3 py-1 font-medium border ${getDifficultyColor(selectedProblem.problem.difficulty)}`}>
                            {selectedProblem.problem.difficulty}
                          </Badge>
                          <Badge className="bg-warning/10 text-warning border-warning/20 px-3 py-1 font-medium">
                            {selectedProblem.points} Points
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Problem Statement</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                          {selectedProblem.problem.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Constraints</h3>
                      <div className="bg-code-bg border border-code-border rounded-xl p-6">
                        <pre className="text-sm text-code-text font-mono whitespace-pre-wrap">
                          {selectedProblem.problem.constraints}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProblem.problem.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className={`${sidebarCollapsed ? 'w-1/2' : 'w-1/2'} flex flex-col bg-code-bg transition-all duration-300`}>
                {/* Editor Header */}
                <div className="bg-muted border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                        <SelectTrigger className="w-40 bg-code-bg border-code-border text-code-text">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={runTest} 
                        variant="code" 
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                      <Button 
                        onClick={submitSolution} 
                        disabled={isSubmitting} 
                        size="sm"
                        variant="success"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={currentLanguage}
                    value={currentCode}
                    onChange={(value) => setCurrentCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      padding: { top: 20, bottom: 20 },
                      scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                        verticalScrollbarSize: 0,
                        horizontalScrollbarSize: 0
                      }
                    }}
                  />
                </div>

                {/* Test Results */}
                {testResults && (
                  <div className="h-64 border-t border-border overflow-hidden bg-muted">
                    <div className="p-6 h-full overflow-y-auto scrollbar-hide">
                      <TestResults 
                        results={testResults.results || []} 
                        summary={testResults.summary || { passed: 0, total: 0, success_rate: 0 }}
                        isVisible={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exit Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="bg-gradient-card border-border shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                Exit Contest?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground mt-4">
                Are you sure you want to exit the contest? Your current solution will be automatically submitted
                and you won't be able to participate again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8">
              <AlertDialogCancel className="px-6">Stay in Contest</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmExit} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6"
              >
                Exit & Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Contest ended or not running
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-card border border-border rounded-full px-4 py-2 shadow-card mb-6">
            {getStatusBadge(contest)}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{contest.title}</h1>
          <p className="text-xl text-muted-foreground mb-12">{contest.description}</p>

          <Card className="bg-gradient-card border-border shadow-card max-w-2xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="p-4 bg-muted rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {contest.is_ended ? 'Contest has ended' : 'Contest has not started yet'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {contest.is_ended 
                    ? 'Thank you for participating! Check the leaderboard for results.'
                    : `Contest starts on ${new Date(contest.start_time).toLocaleString()}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}