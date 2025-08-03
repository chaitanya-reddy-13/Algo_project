import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerdictBadge } from '@/components/problem/VerdictBadge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Code, Clock, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { submissionsAPI, Submission, contestsAPI, ContestSubmission } from '@/lib/api';

export function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contestSubmissions, setContestSubmissions] = useState<ContestSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestLoading, setContestLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contestSearchTerm, setContestSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [contestVerdictFilter, setContestVerdictFilter] = useState<string>('all');
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(new Set());
  const [expandedContestSubmissions, setExpandedContestSubmissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await submissionsAPI.getSubmissions({
          verdict: verdictFilter !== 'all' ? verdictFilter : undefined,
        });
        // Handle paginated response structure
        const submissionsData = response.data.results || response.data;
        setSubmissions(submissionsData || []);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [verdictFilter]);

  useEffect(() => {
    const fetchContestSubmissions = async () => {
      try {
        const response = await contestsAPI.getUserContestSubmissions();
        const contestSubmissionsData = response.data.results || response.data;
        setContestSubmissions(contestSubmissionsData || []);
      } catch (error) {
        console.error('Failed to fetch contest submissions:', error);
        setContestSubmissions([]);
      } finally {
        setContestLoading(false);
      }
    };

    fetchContestSubmissions();
  }, []);

  const filteredSubmissions = (submissions || []).filter(submission =>
    searchTerm === '' || submission.id.toString().includes(searchTerm)
  );

  const filteredContestSubmissions = (contestSubmissions || []).filter(submission =>
    contestSearchTerm === '' || submission.id.toString().includes(contestSearchTerm)
  );

  const toggleSubmissionExpansion = (submissionId: number) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const toggleContestSubmissionExpansion = (submissionId: number) => {
    const newExpanded = new Set(expandedContestSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedContestSubmissions(newExpanded);
  };

  const renderSubmissionCard = (submission: Submission) => (
          <Card key={submission.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    Submission #{submission.id}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Link 
                        to={`/problems/${typeof submission.problem === 'object' ? submission.problem.id : submission.problem}`}
                        className="text-primary hover:underline"
                      >
                        Problem #{typeof submission.problem === 'object' ? submission.problem.id : submission.problem}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      {submission.language}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <VerdictBadge verdict={submission.verdict} />
                  {submission.execution_time && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {submission.execution_time}ms
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSubmissionExpansion(submission.id)}
                  className="text-xs"
                >
                  {expandedSubmissions.has(submission.id) ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide Code
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show Code
                    </>
                  )}
                </Button>
                
                {submission.test_cases_passed !== undefined && submission.total_test_cases !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    {submission.test_cases_passed}/{submission.total_test_cases} test cases passed
                  </div>
                )}
              </div>
            </CardHeader>
            
            {expandedSubmissions.has(submission.id) && (
              <CardContent className="pt-0">
                <div className="bg-code-bg border border-code-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Submitted Code ({submission.language})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {submission.code.length} characters
                    </span>
                  </div>
                  <pre className="text-sm text-code-text overflow-x-auto whitespace-pre-wrap font-mono">
                    <code>{submission.code}</code>
                  </pre>
                </div>
                
                {submission.error_message && (
                  <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="text-sm font-medium text-destructive mb-2">Error Message</div>
                    <pre className="text-sm text-destructive overflow-x-auto whitespace-pre-wrap">
                      {submission.error_message}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
  );

  const renderContestSubmissionCard = (submission: ContestSubmission) => (
    <Card key={submission.id} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">
              Contest Submission #{submission.id}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-warning" />
                <Link 
                  to={`/contests/${submission.contest.id}`}
                  className="text-warning hover:underline"
                >
                  {submission.contest.title}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <Link 
                  to={`/problems/${typeof submission.problem === 'object' ? submission.problem.id : submission.problem}`}
                  className="text-primary hover:underline"
                >
                  Problem #{typeof submission.problem === 'object' ? submission.problem.id : submission.problem}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                {submission.language}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(submission.submitted_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <VerdictBadge verdict={submission.verdict} />
            <div className="text-sm text-warning font-medium">
              Score: {submission.score}
            </div>
            {submission.execution_time && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {submission.execution_time}ms
              </div>
            )}
          </div>
      </div>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleContestSubmissionExpansion(submission.id)}
            className="text-xs"
          >
            {expandedContestSubmissions.has(submission.id) ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide Code
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show Code
              </>
            )}
          </Button>
          
          {submission.test_cases_passed !== undefined && submission.total_test_cases !== undefined && (
            <div className="text-sm text-muted-foreground">
              {submission.test_cases_passed}/{submission.total_test_cases} test cases passed
            </div>
          )}
        </div>
      </CardHeader>
      
      {expandedContestSubmissions.has(submission.id) && (
        <CardContent className="pt-0">
          <div className="bg-code-bg border border-code-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Submitted Code ({submission.language})
              </span>
              <span className="text-xs text-muted-foreground">
                {submission.code.length} characters
              </span>
            </div>
            <pre className="text-sm text-code-text overflow-x-auto whitespace-pre-wrap font-mono">
              <code>{submission.code}</code>
            </pre>
          </div>
          
          {submission.error_message && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="text-sm font-medium text-destructive mb-2">Error Message</div>
              <pre className="text-sm text-destructive overflow-x-auto whitespace-pre-wrap">
                {submission.error_message}
              </pre>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (loading || contestLoading) {
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
      <h1 className="text-3xl font-bold">My Submissions</h1>
      
      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">Regular Submissions</TabsTrigger>
          <TabsTrigger value="contest">Contest Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by submission ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-code-bg border-code-border"
                />
              </div>
              
              <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                <SelectTrigger className="w-48 bg-code-bg border-code-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verdicts</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
                  <SelectItem value="Time Limit Exceeded">Time Limit Exceeded</SelectItem>
                  <SelectItem value="Compilation Error">Compilation Error</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredSubmissions.map(renderSubmissionCard)}
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No regular submissions found.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="contest" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by submission ID..."
                  value={contestSearchTerm}
                  onChange={(e) => setContestSearchTerm(e.target.value)}
                  className="pl-10 bg-code-bg border-code-border"
                />
              </div>
              
              <Select value={contestVerdictFilter} onValueChange={setContestVerdictFilter}>
                <SelectTrigger className="w-48 bg-code-bg border-code-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verdicts</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Wrong Answer">Wrong Answer</SelectItem>
                  <SelectItem value="Time Limit Exceeded">Time Limit Exceeded</SelectItem>
                  <SelectItem value="Compilation Error">Compilation Error</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredContestSubmissions.map(renderContestSubmissionCard)}
          </div>

          {filteredContestSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No contest submissions found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}